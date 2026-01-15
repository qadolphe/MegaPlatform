import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, validateContentItem } from '../../shared';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const { slug } = await params;
    
    // 1. Get Model
    const { data: model } = await supabase
        .from('content_models')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .single();
        
    if (!model) return NextResponse.json({ error: `Collection '${slug}' not found` }, { status: 404 });
    
    // 2. Get Items
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
        .from('content_items')
        .select('*')
        .eq('model_id', model.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
    // Simple Filters: filter[key]=value
    // Note: This relies on Supabase JSONB filtering.
    for (const [key, value] of searchParams.entries()) {
        if (key.startsWith('filter[')) {
             const field = key.match(/filter\[(.*?)\]/)?.[1];
             if (field) {
                 // JSONB filtering syntax: data->>field = value
                 query = query.eq(`data->>${field}`, value);
             }
        }
    }
    
    const { data: items, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(items);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const { slug } = await params;
    
    const body = await request.json().catch(() => ({}));
    
    // 1. Get Model
    const { data: model } = await supabase
        .from('content_models')
        .select('id, schema') 
        .eq('store_id', storeId)
        .eq('slug', slug)
        .single();
        
    if (!model) return NextResponse.json({ error: `Collection '${slug}' not found` }, { status: 404 });
    
    // 2. Validate Data
    const rawData = body.data || body;
    let validatedData, references;

    try {
        const result = validateContentItem(model.schema, rawData);
        validatedData = result.validatedData;
        references = result.references;
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
    
    // 3. Insert
    const { data: newItem, error } = await supabase
        .from('content_items')
        .insert({
            store_id: storeId,
            model_id: model.id,
            data: validatedData,
            "references": references
        })
        .select()
        .single();
        
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(newItem);
}
