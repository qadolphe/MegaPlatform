import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, validateContentItem } from '../../../shared';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const { id } = await params;
    
    const { data: item, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('store_id', storeId)
        .eq('id', id)
        .single();
        
    if (error || !item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    
    return NextResponse.json(item);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updates = body.data || body;

    const { data: existing } = await supabase
        .from('content_items')
        .select('data, model_id')
        .eq('store_id', storeId)
        .eq('id', id)
        .single();
        
    if (!existing) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    // Fetch Model Schema for validation
    const { data: model } = await supabase
        .from('content_models')
        .select('schema')
        .eq('id', existing.model_id)
        .single();

    if (!model) return NextResponse.json({ error: 'Model definition not found' }, { status: 500 });
    
    const newData = { ...existing.data, ...updates };
    let validatedData, references;

    try {
        const result = validateContentItem(model.schema, newData);
        validatedData = result.validatedData;
        references = result.references;
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
    
    const { data: updated, error } = await supabase
        .from('content_items')
        .update({ 
            data: validatedData,
            "references": references,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(updated);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    const api = await validateApiKey(request);
    if ('error' in api) return NextResponse.json(api, { status: api.status });
    
    const { supabase, storeId } = api;
    const { id } = await params;
    
    const { error } = await supabase
        .from('content_items')
        .delete()
        .eq('store_id', storeId)
        .eq('id', id);
        
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json({ success: true });
}
