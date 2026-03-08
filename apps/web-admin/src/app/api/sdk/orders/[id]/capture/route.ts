import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../../shared';
import { billing } from '@repo/services';
import { createClient } from '@supabase/supabase-js';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });

    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required to capture payments' }, { status: 403 });
    }

    const { supabase, storeId, isTestMode } = api;
    const { id } = await params;

    try {
        const { finalAmountInCents } = await request.json();

        if (!finalAmountInCents || typeof finalAmountInCents !== 'number' || finalAmountInCents <= 0) {
            return NextResponse.json({ error: 'finalAmountInCents is required and must be a positive number' }, { status: 400 });
        }

        // Fetch the order and verify it belongs to this store
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, customer:customers(*)')
            .eq('id', id)
            .eq('store_id', storeId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!order.stripe_payment_intent_id) {
            return NextResponse.json({ error: 'Order has no Stripe payment intent' }, { status: 400 });
        }

        if (order.payment_status !== 'authorized') {
            return NextResponse.json({ error: `Cannot capture order with payment_status "${order.payment_status}". Expected "authorized".` }, { status: 400 });
        }

        // Look up the store's Stripe account ID for the connected account call
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('stripe_account_id, stripe_account_id_test')
            .eq('id', storeId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const stripeAccountId = isTestMode ? store.stripe_account_id_test : store.stripe_account_id;

        if (!stripeAccountId) {
            return NextResponse.json({ error: 'Store has no Stripe account configured' }, { status: 400 });
        }

        // Capture the payment intent on the connected account
        const intent = await billing.capturePaymentIntent(
            order.stripe_payment_intent_id,
            finalAmountInCents,
            stripeAccountId,
            isTestMode
        );

        // Update order payment status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_status: 'captured',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('store_id', storeId);

        if (updateError) {
            console.error('Failed to update order payment_status after capture:', updateError);
            // Payment was captured on Stripe but DB update failed — log but still return success
        }

        return NextResponse.json({ success: true, intent });
    } catch (error: any) {
        console.error('Payment capture error:', error);
        return NextResponse.json(
            { error: error.message || 'Payment capture failed' },
            { status: 500 }
        );
    }
}
