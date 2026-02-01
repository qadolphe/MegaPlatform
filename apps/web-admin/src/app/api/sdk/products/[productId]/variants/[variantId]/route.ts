import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../../../shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sdk/products/{productId}/variants/{variantId}
 * Get a single variant
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { productId, variantId } = await params;

        // Verify product belongs to this store
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Fetch the variant
        const { data: variant, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('id', variantId)
            .eq('product_id', productId)
            .single();

        if (error || !variant) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        return NextResponse.json(variant);

    } catch (error) {
        console.error('SDK get variant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/sdk/products/{productId}/variants/{variantId}
 * Update a variant
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { productId, variantId } = await params;
        const body = await request.json();

        // Verify product belongs to this store
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Sanitize update data
        const updateData: any = {};
        const allowedFields = [
            'title', 'sku', 'price', 'inventory_quantity', 'options',
            'description', 'image_url', 'images', 'barcode', 'weight', 'weight_unit'
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const { data: variant, error } = await supabase
            .from('product_variants')
            .update(updateData)
            .eq('id', variantId)
            .eq('product_id', productId)
            .select()
            .single();

        if (error) {
            console.error('SDK update variant error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(variant);

    } catch (error) {
        console.error('SDK update variant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/sdk/products/{productId}/variants/{variantId}
 * Delete a variant
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { productId, variantId } = await params;

        // Verify product belongs to this store
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('product_variants')
            .delete()
            .eq('id', variantId)
            .eq('product_id', productId);

        if (error) {
            console.error('SDK delete variant error:', error);
            return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('SDK delete variant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
