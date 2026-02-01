import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../../shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sdk/products/{productId}/variants
 * List all variants for a product
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { productId } = await params;

        // Verify product belongs to this store
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Fetch variants
        const { data: variants, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .order('title');

        if (error) {
            console.error('SDK variants list error:', error);
            return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
        }

        return NextResponse.json(variants || []);

    } catch (error) {
        console.error('SDK variants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/sdk/products/{productId}/variants
 * Create a new variant for a product
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { productId } = await params;
        const body = await request.json();

        // Verify product belongs to this store and get base price
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, price')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Build variant data
        const variantData = {
            product_id: productId,
            title: body.title || 'Default',
            sku: body.sku || null,
            price: body.price !== undefined ? body.price : product.price,
            inventory_quantity: body.inventory_quantity || 0,
            options: body.options || {},
            description: body.description || null,
            image_url: body.image_url || null,
            images: body.images || []
        };

        const { data: variant, error } = await supabase
            .from('product_variants')
            .insert(variantData)
            .select()
            .single();

        if (error) {
            console.error('SDK create variant error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(variant, { status: 201 });

    } catch (error) {
        console.error('SDK create variant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
