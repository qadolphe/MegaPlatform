import { NextRequest, NextResponse } from 'next/server';
import { hydrateCart } from '../../utils';
import { validateApiKey } from '../../../shared';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ cartId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { supabase, storeId } = validation;
        const { cartId } = await params;
        const body = await request.json();
        const newItems = body.items || [];

        // Fetch existing
        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('id', cartId)
            .single();

        if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        if (cart.store_id !== storeId) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

        // Merge logic
        // If item exists (same productId + variantId), sum quantity
        // Else add
        let currentItems = (cart.items as any[]) || [];
        
        // Ensure strictly array
        if (!Array.isArray(currentItems)) currentItems = [];

        newItems.forEach((newItem: any) => {
            const existingIndex = currentItems.findIndex((ci: any) => 
                ci.productId === newItem.productId && ci.variantId === newItem.variantId
            );

            if (existingIndex >= 0) {
                currentItems[existingIndex].quantity += newItem.quantity;
            } else {
                currentItems.push(newItem);
            }
        });

        // Update DB
        const { data: updatedCart, error } = await supabase
            .from('carts')
            .update({ items: currentItems, updated_at: new Date().toISOString() })
            .eq('id', cartId)
            .select()
            .single();

        if (error || !updatedCart) {
             return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
        }

        const hydrated = await hydrateCart(updatedCart, supabase);
        return NextResponse.json(hydrated);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
