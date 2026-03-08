import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../shared';

export async function POST(request: NextRequest) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });

    if (!api.isSecretKey) {
        return NextResponse.json({ error: 'Forbidden: Secret Key required to submit requests' }, { status: 403 });
    }

    const { supabase, storeId } = api;

    try {
        const { type, payload } = await request.json();

        if (!type || typeof type !== 'string') {
            return NextResponse.json({ error: 'type is required and must be a string' }, { status: 400 });
        }

        if (!payload || typeof payload !== 'object') {
            return NextResponse.json({ error: 'payload is required and must be an object' }, { status: 400 });
        }

        const { data: customerRequest, error } = await supabase
            .from('customer_requests')
            .insert({
                store_id: storeId,
                type,
                payload,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating customer request:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(customerRequest, { status: 201 });
    } catch (error: any) {
        console.error('Customer request error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit request' },
            { status: 500 }
        );
    }
}
