import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../shared';

export async function GET(request: NextRequest) {
    try {
        const validation = await validateApiKey(request);
        if ('error' in validation) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }

        const { storeId, supabase } = validation;

        const { data: store, error } = await supabase
            .from('stores')
            .select('id, name, subdomain, theme, colors, currency')
            .eq('id', storeId)
            .single();

        if (error || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json(store);

    } catch (error) {
        console.error('SDK store error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
