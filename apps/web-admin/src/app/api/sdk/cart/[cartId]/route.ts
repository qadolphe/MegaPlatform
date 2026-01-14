import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, hydrateCart } from '../utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ cartId: string }> }
) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { supabase } = validation;
        const { cartId } = await params;

        const { data: cart, error } = await supabase
            .from('carts')
            .select('*')
            .eq('id', cartId)
            .single();

        if (error || !cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        // Validate Key? X-SwatBloc-Key means authorized for that store.
        // We should probably check if cart.store_id matches valid storeId from key?
        // But the middleware/setup implies public keys are scoped.
        // Let's enforce it.
        if (cart.store_id !== validation.storeId) {
             // For privacy, return 404 instead of 403
             return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const hydrated = await hydrateCart(cart, supabase);
        return NextResponse.json(hydrated);

    } catch (error) {
        console.error('Cart Get error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
