import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { billing } from '@repo/services';

interface CartItem {
    id: string;
    name: string;
    price: number; // in cents
    quantity: number;
    image?: string;
    type?: 'kit' | 'service';
    slug: string;
}

export async function POST(request: Request) {
    try {
        // Validate environment variables
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('STRIPE_SECRET_KEY is not configured');
            return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Supabase environment variables not configured');
            return NextResponse.json({ error: 'Database service not configured' }, { status: 500 });
        }

        const { items, returnUrl } = await request.json() as { items: CartItem[]; returnUrl?: string };

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        const headersList = await headers();
        let host = headersList.get('host') || '';

        // Remove port if present
        host = host.split(':')[0];

        const origin = headersList.get('origin') || `https://${host}`;

        console.log('Checkout request - Host:', host, 'Origin:', origin);

        // Parse subdomain from host
        let subdomain: string | null = null;

        if (host.includes('localhost')) {
            const parts = host.split('.');
            if (parts.length > 1 && parts[0] !== 'localhost') {
                subdomain = parts[0];
            }
        } else if (host.includes('hoodieplatform.com') || host.includes('swatbloc.com')) {
            // Handle subdomains like real-hoodie.swatbloc.com
            const parts = host.split('.');
            if (parts.length >= 3) {
                subdomain = parts[0]; // real-hoodie
            }
        }

        console.log('Parsed subdomain:', subdomain);

        // Use Service Role for admin access
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Find the store by subdomain or custom_domain
        let storeQuery = supabase
            .from('stores')
            .select('id, stripe_account_id, stripe_details_submitted, currency, name, subdomain, is_test_mode');

        if (subdomain) {
            storeQuery = storeQuery.eq('subdomain', subdomain);
        } else {
            // Try custom domain
            storeQuery = storeQuery.eq('custom_domain', host);
        }

        const { data: store, error: storeError } = await storeQuery.single();

        if (storeError) {
            console.error('Store lookup failed:', storeError, 'Subdomain:', subdomain, 'Host:', host);
            return NextResponse.json({ error: 'Store not found', details: storeError.message }, { status: 404 });
        }

        if (!store) {
            console.error('No store found for subdomain:', subdomain, 'Host:', host);
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        console.log('Found store:', store.name, 'ID:', store.id);

        // Check if store has completed Stripe onboarding
        if (!store.stripe_account_id) {
            console.error('Store missing stripe_account_id:', store.id);
            return NextResponse.json({
                error: 'Store has not set up payments. Please complete Stripe Connect onboarding.'
            }, { status: 400 });
        }

        if (!store.stripe_details_submitted) {
            console.error('Store Stripe details not submitted:', store.id);
            return NextResponse.json({
                error: 'Store payment setup is incomplete. Please complete Stripe onboarding.'
            }, { status: 400 });
        }

        // Build line items for Stripe
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
            price_data: {
                currency: store.currency || 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : undefined,
                },
                unit_amount: item.price, // Already in cents
            },
            quantity: item.quantity,
        }));

        // Calculate total for application fee (platform takes 5%)
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const applicationFeeAmount = Math.round(total * 0.05); // 5% platform fee

        console.log('Creating Stripe session - Total:', total, 'Fee:', applicationFeeAmount);

        // Create Stripe Checkout Session
        const session = await billing.createCheckoutSession({
            storeId: store.id,
            stripeAccountId: store.stripe_account_id,
            lineItems: lineItems,
            successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}${returnUrl || '/'}`,
            applicationFeeAmount: applicationFeeAmount,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            isTestMode: (store as any).is_test_mode,
            metadata: {
                items: JSON.stringify(items.map(i => ({ id: i.id, qty: i.quantity, price: i.price }))),
            },
        });

        console.log('Stripe session created:', session.id);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Checkout failed', stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
            { status: 500 }
        );
    }
}

