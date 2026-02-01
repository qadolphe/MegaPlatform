import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

// Helper to sign product image URL
async function signProductImage(product: any, supabase: any) {
    if (product && product.image_key) {
        // Use 'media' bucket, valid for 24 hours
        const { data } = await supabase.storage
            .from('media')
            .createSignedUrl(product.image_key, 60 * 60 * 24);
            
        if (data?.signedUrl) {
            // Prepend signed URL to images array so it's the first image
            product.images = [data.signedUrl, ...(product.images || [])];
        }
    }
    return product;
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
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: products, error } = await query;

        if (error) {
            console.error('SDK products error:', error);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        // Sign image URLs
        const productsWithSignedUrls = await Promise.all(
            (products || []).map((p: any) => signProductImage(p, supabase))
        );

        return NextResponse.json(productsWithSignedUrls, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });

    } catch (error) {
        console.error('SDK products error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const body = await request.json();

        const title = body.title || body.name;

        // Basic Validation
        if (!title) {
             return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
        }

        const productData = {
            store_id: storeId,
            title: title,
            description: body.description || '',
            price: body.price || 0,
            compare_at_price: body.compare_at_price || null,
            images: body.images || [],
            category: body.category || null,
            inventory_quantity: body.inventory_quantity || 0,
            sku: body.sku || null,
            barcode: body.barcode || null,
            weight: body.weight || null,
            weight_unit: body.weight_unit || 'kg',
            slug: body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7),
            published: body.published !== undefined ? body.published : true,
            image_key: body.image_key || null,
            options: body.options || [],
            metafields: body.metafields || []
        };

        const { data: product, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
            console.error('SDK create product error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const signedProduct = await signProductImage(product, supabase);

        return NextResponse.json(signedProduct);

    } catch (error) {
        console.error('SDK create product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
             return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
        }
        
        // Sanitize update data - block store_id changes
        const updateData: any = { ...body };
        delete updateData.store_id;
        delete updateData.id;
        delete updateData.created_at;

        // Auto-generate slug if title changes and slug isn't provided? 
        // For now, let's keep it simple. Only update provided fields.
        
        if (updateData.title && !updateData.slug) {
             // Optional: regenerating slug logic could go here
        }

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();

        if (error) {
            console.error('SDK update product error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const signedProduct = await signProductImage(product, supabase);

        return NextResponse.json(signedProduct);

    } catch (error) {
        console.error('SDK update product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) {
            console.error('SDK delete product error:', error);
            return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('SDK delete product error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
