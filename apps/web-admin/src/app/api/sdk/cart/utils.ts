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
    const variantIds = cart.items.map((i: any) => i.variantId).filter(Boolean);
    
    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

    // Fetch variants
    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .in('id', variantIds);

    const productMap = new Map(products?.map(p => [p.id, p]) || []);
    const variantMap = new Map(variants?.map(v => [v.id, v]) || []);
    let subtotal = 0;

    const hydratedItems = cart.items.map((item: any) => {
        const product = productMap.get(item.productId);
        if (!product) return null; // Product might have been deleted

        let price = product.price;
        let variant = null;

        if (item.variantId) {
            variant = variantMap.get(item.variantId);
            if (variant) {
                price = variant.price;
            }
        }

        const total = price * item.quantity;
        subtotal += total;

        return {
            product: {
                id: product.id,
                name: product.title,
                slug: product.slug,
                description: product.description,
                price: price, // Use resolved price (variant or product)
                compare_at_price: product.compare_at_price,
                images: product.images,
                inventory_quantity: 0, // TODO: Fetch inventory?
                is_active: product.published
            },
            variant: variant ? {
                id: variant.id,
                title: variant.title,
                sku: variant.sku,
                image_url: variant.image_url
            } : null,
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
