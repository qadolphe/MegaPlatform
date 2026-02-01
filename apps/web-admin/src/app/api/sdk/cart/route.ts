import { NextRequest, NextResponse } from 'next/server';
import { hydrateCart } from './utils';
import { validateApiKey } from '../shared';

export async function POST(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        
        const { storeId, supabase } = validation;
        const body = await request.json();
        const items = body.items || [];

        // Insert new cart
        const { data: cart, error } = await supabase
            .from('carts')
            .insert({
                store_id: storeId,
                items: items,
                currency: 'usd' // Default, should ideally come from store settings
            })
            .select()
            .single();

        if (error) {
            console.error('Cart creation error:', error);
            return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
        }

        const hydrated = await hydrateCart(cart, supabase);
        return NextResponse.json(hydrated);

    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
