import { NextRequest, NextResponse } from 'next/server';
import { hydrateCart } from '../../../utils';
import { validateApiKey } from '../../../../shared';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ cartId: string; productId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { supabase, storeId } = validation;
        const { cartId, productId } = await params;
        const body = await request.json();
        const { quantity } = body;

        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('id', cartId)
            .single();

        if (!cart || cart.store_id !== storeId) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

        let currentItems = (cart.items as any[]) || [];
        // Note: Logic here is a bit fuzzy if variants exist, as productId alone isn't unique.
        // But SDK `updateItem` takes `productId` and assumes. 
        // We will update ALL items with that productId or find the first one. 
        // Ideally the API should take lineItemId or variantId too.
        // For now, we match productId.
        
        const index = currentItems.findIndex((ci: any) => ci.productId === productId);
        if (index === -1) {
            return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
        }

        if (quantity <= 0) {
            // Remove
            currentItems.splice(index, 1);
        } else {
            currentItems[index].quantity = quantity;
        }

        const { data: updatedCart, error } = await supabase
            .from('carts')
            .update({ items: currentItems, updated_at: new Date().toISOString() })
            .eq('id', cartId)
            .select()
            .single();

        if (error || !updatedCart) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        
        const hydrated = await hydrateCart(updatedCart, supabase);
        return NextResponse.json(hydrated);

    } catch (error) {
         return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ cartId: string; productId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { supabase, storeId } = validation;
        const { cartId, productId } = await params;

        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('id', cartId)
            .single();

         if (!cart || cart.store_id !== storeId) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

         let currentItems = (cart.items as any[]) || [];
         currentItems = currentItems.filter((ci: any) => ci.productId !== productId);

         const { data: updatedCart, error } = await supabase
            .from('carts')
            .update({ items: currentItems, updated_at: new Date().toISOString() })
            .eq('id', cartId)
            .select()
            .single();

        if (error || !updatedCart) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        
        const hydrated = await hydrateCart(updatedCart, supabase);
        return NextResponse.json(hydrated);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
