import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../shared';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    // Only secret keys can read orders by ID (for now)
    // In future, public keys could read 'my' orders if customer session is verified
    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required to read orders' }, { status: 403 });
    }

    const { supabase, storeId } = api;
    const { id } = await params;

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*),
            customer:customers(*)
        `)
        .eq('id', id)
        .eq('store_id', storeId)
        .single();

    if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required to update orders' }, { status: 403 });
    }

    const { supabase, storeId } = api;
    const { id } = await params;
    const body = await request.json();

    // Whitelist updateable fields
    const updates: Record<string, any> = {};
    const allowedFields = ['status', 'fulfillment_status', 'payment_status', 'metafields', 'shipping_address', 'billing_address'];

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }

    updates['updated_at'] = new Date().toISOString();

    const { data: order, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .eq('store_id', storeId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(order);
}
