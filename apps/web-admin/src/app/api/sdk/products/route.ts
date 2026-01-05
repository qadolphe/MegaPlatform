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

    // Update last_used_at
    await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('public_key', apiKey);

    return { storeId: keyData.store_id, supabase };
}

export async function GET(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { searchParams } = new URL(request.url);

        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let query = supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .eq('published', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: products, error } = await query;

        if (error) {
            console.error('SDK products error:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        return NextResponse.json(products);

    } catch (error) {
        console.error('SDK products error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
