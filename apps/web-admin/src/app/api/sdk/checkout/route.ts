import { NextRequest, NextResponse } from 'next/server';
import { hydrateCart } from '../cart/utils';
import { validateApiKey } from '../shared';
import Stripe from 'stripe';
import { billing } from '@repo/services';

export async function POST(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { storeId, supabase, isTestMode } = validation;
        const body = await request.json();
        const { cartId, successUrl, cancelUrl } = body;

        if (!cartId || !successUrl || !cancelUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Store (for Stripe connection)
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, stripe_account_id, stripe_account_id_test, stripe_details_submitted, stripe_details_submitted_test, currency')
            .eq('id', storeId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const stripeAccountId = isTestMode ? store.stripe_account_id_test : store.stripe_account_id;
        const detailsSubmitted = isTestMode ? store.stripe_details_submitted_test : store.stripe_details_submitted;

        console.log('SDK Checkout Debug:', {
            isTestMode,
            storeId: store.id,
            stripeAccountId,
            dbTestId: store.stripe_account_id_test,
            dbLiveId: store.stripe_account_id
        });

        if (!stripeAccountId || !detailsSubmitted) {
            return NextResponse.json({ error: `Store not configured for ${isTestMode ? 'Test' : 'Live'} payments` }, { status: 400 });
        }

        // 2. Fetch Cart
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('*')
            .eq('id', cartId)
            .single();

        if (cartError || !cart || cart.store_id !== storeId) {
             return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        // 3. Hydrate Cart (Security: get real prices from DB)
        const hydratedCart = await hydrateCart(cart, supabase);

        if (!hydratedCart.items || hydratedCart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = hydratedCart.items.map((item: any) => ({
            price_data: {
                currency: store.currency || 'usd',
                product_data: {
                    name: item.product.name,
                    images: item.product.images?.length ? [item.product.images[0]] : [],
                },
                unit_amount: item.product.price, // In cents
            },
            quantity: item.quantity,
        }));

        const total = hydratedCart.subtotal;
        const applicationFeeAmount = Math.round(total * 0.05); // 5% Platform Fee

        // Prep metadata items (be mindful of 500 char limit)
        const itemsForMetadata = hydratedCart.items.map((item: any) => ({
            id: item.product.id,
            qty: item.quantity,
            price: item.product.price
        }));

        const session = await billing.createCheckoutSession({
            storeId: store.id,
            stripeAccountId: stripeAccountId,
            lineItems,
            successUrl,
            cancelUrl,
            applicationFeeAmount,
            metadata: {
                cartId: cart.id,
                items: JSON.stringify(itemsForMetadata).slice(0, 500) // Safety
            },
            isTestMode
        });

        return NextResponse.json({
            id: session.id,
            url: session.url,
            expiresAt: new Date(session.expires_at * 1000).toISOString(),
            debug: process.env.NODE_ENV === 'development' ? {
                mode: isTestMode ? 'test' : 'live',
                storeId: store.id
            } : undefined
        });

    } catch (error: any) {
        console.error('Checkout creation error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
