import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../../../../shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sdk/products/{productId}/variants/generate
 * Auto-generate variants from product options (Cartesian product)
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
        const body = await request.json().catch(() => ({}));

        // Get product with options
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, price, options')
            .eq('id', productId)
            .eq('store_id', storeId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const options = product.options || [];

        if (!options.length || !options.every((o: any) => o.values?.length > 0)) {
            return NextResponse.json({
                error: 'Product must have at least one option with values defined'
            }, { status: 400 });
        }

        // Generate Cartesian product of all option values
        const combinations = generateCartesianProduct(options);

        if (combinations.length > 100) {
            return NextResponse.json({
                error: `Too many variants (${combinations.length}). Maximum is 100. Reduce option values.`
            }, { status: 400 });
        }

        // Check if we should replace existing or merge
        const replaceExisting = body.replace_existing !== false; // Default true

        if (replaceExisting) {
            // Delete existing variants
            await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', productId);
        }

        // Create variant records
        const variantsToInsert = combinations.map((combo, index) => ({
            product_id: productId,
            title: Object.values(combo).join(' / '),
            sku: null,
            price: product.price,
            inventory_quantity: 0,
            options: combo,
            description: null,
            image_url: null,
            images: []
        }));

        const { data: variants, error } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)
            .select();

        if (error) {
            console.error('SDK generate variants error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            message: `Generated ${variants?.length || 0} variants`,
            variants: variants || []
        }, { status: 201 });

    } catch (error) {
        console.error('SDK generate variants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Generate Cartesian product from options
 * Example: [{name: "Size", values: ["S", "M"]}, {name: "Color", values: ["Red", "Blue"]}]
 * Returns: [{Size: "S", Color: "Red"}, {Size: "S", Color: "Blue"}, {Size: "M", Color: "Red"}, {Size: "M", Color: "Blue"}]
 */
function generateCartesianProduct(options: Array<{ name: string; values: string[] }>): Record<string, string>[] {
    if (options.length === 0) return [{}];

    const result: Record<string, string>[] = [];

    function recurse(index: number, current: Record<string, string>) {
        if (index === options.length) {
            result.push({ ...current });
            return;
        }

        const option = options[index];
        for (const value of option.values) {
            current[option.name] = value;
            recurse(index + 1, current);
        }
    }

    recurse(0, {});
    return result;
}
