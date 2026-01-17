import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../shared';

export async function GET(request: NextRequest) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    
    const { data: models, error } = await supabase
        .from('content_models')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
        
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(models);
}

export async function POST(request: NextRequest) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const body = await request.json().catch(() => ({}));
    
    const { name, slug, schema } = body;
    
    if (!name || !slug) {
        return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    
    // Check if exists (Idempotency)
    const { data: existing } = await supabase
        .from('content_models')
        .select('*')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .single();
        
    if (existing) {
        // Optional: Update schema if provided? For now, just return existing.
        // The prompt says "Make it idempotent (createIfNotExists)."
        return NextResponse.json(existing);
    }
    
    const { data: newModel, error } = await supabase
        .from('content_models')
        .insert({
            store_id: storeId,
            name,
            slug,
            schema: schema || { fields: [] }
        })
        .select()
        .single();
        
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(newModel);
}
