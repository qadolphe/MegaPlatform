import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Helper to validate API key and get store
async function validateApiKey(request: NextRequest) {
    const apiKey = request.headers.get('X-SwatBloc-Key');

    if (!apiKey) {
        return { error: 'Missing API key', status: 401 };
    }

    if (!apiKey.startsWith('pk_')) {
        return { error: 'Invalid API key format', status: 401 };
    }

    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('store_id, is_active')
        .eq('public_key', apiKey)
        .single();

    if (keyError || !keyData) {
        return { error: 'Invalid API key', status: 401 };
    }

    if (!keyData.is_active) {
        return { error: 'API key has been revoked', status: 401 };
    }

    return { storeId: keyData.store_id, supabase };
}

export async function GET(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;

        const { data: store, error } = await supabase
            .from('stores')
            .select('id, name, subdomain, theme, colors, currency')
            .eq('id', storeId)
            .single();

        if (error || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json(store);

    } catch (error) {
        console.error('SDK store error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
