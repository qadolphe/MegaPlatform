import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../shared';

export async function GET(request: NextRequest) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    // Only secret keys can list all orders
    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required to list orders' }, { status: 403 });
    }

    const { supabase, storeId } = api;
    const searchParams = request.nextUrl.searchParams;
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let query = supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders);
}

// TODO: POST for manual order creation if needed
