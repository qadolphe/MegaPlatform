import { NextRequest } from 'next/server';
import { createClient as createAdminClient, SupabaseClient } from '@supabase/supabase-js';

export async function validateApiKey(request: NextRequest) {
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

    // Update last_used_at (optional - maybe skip for speed on cart ops?)
    // await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('public_key', apiKey);

    return { storeId: keyData.store_id, supabase };
}

export async function hydrateCart(cart: any, supabase: SupabaseClient) {
    if (!cart.items || cart.items.length === 0) {
        return {
            id: cart.id,
            items: [],
            subtotal: 0,
            currency: cart.currency || 'usd'
        };
    }

    const productIds = cart.items.map((i: any) => i.productId);
    
    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

    const productMap = new Map(products?.map(p => [p.id, p]) || []);
    let subtotal = 0;

    const hydratedItems = cart.items.map((item: any) => {
        const product = productMap.get(item.productId);
        if (!product) return null; // Product might have been deleted

        const price = product.price; // TODO: Handle variant price if variantId exists
        const total = price * item.quantity;
        subtotal += total;

        return {
            product: {
                id: product.id,
                name: product.title,
                slug: product.slug,
                description: product.description,
                price: product.price,
                compare_at_price: product.compare_at_price,
                images: product.images,
                inventory_quantity: 0, // TODO: Fetch inventory?
                is_active: product.published
            },
            quantity: item.quantity,
            variantId: item.variantId
        };
    }).filter(Boolean);

    return {
        id: cart.id,
        items: hydratedItems,
        subtotal,
        currency: cart.currency || 'usd'
    };
}
