import { NextRequest } from 'next/server';
import { createClient as createAdminClient, SupabaseClient } from '@supabase/supabase-js';
import { validateApiKey } from '../shared';

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
