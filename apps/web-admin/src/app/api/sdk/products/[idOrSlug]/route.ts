import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, signProductImage } from '../../shared';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ idOrSlug: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { idOrSlug } = await params;

        // Try by ID first, then by slug
        let query = supabase
            .from('products')
            .select('*')
            .eq('store_id', storeId)
            .eq('published', true);

        // Check if it looks like a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        if (isUuid) {
            query = query.eq('id', idOrSlug);
        } else {
            query = query.eq('slug', idOrSlug);
        }

        const { data: product, error } = await query.single();

        if (error || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const signedProduct = await signProductImage(product, supabase);

        return NextResponse.json(signedProduct, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });

    } catch (error) {
        console.error('SDK product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
