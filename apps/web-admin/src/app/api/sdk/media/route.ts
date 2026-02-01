import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '../shared';

export const dynamic = 'force-dynamic';

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
        const search = searchParams.get('search');

        let query = supabase
            .from('media_assets')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.ilike('filename', `%${search}%`);
        }

        const { data: assets, error } = await query;

        if (error) {
            console.error('SDK media list error:', error);
            return NextResponse.json({ error: 'Failed to fetch media library' }, { status: 500 });
        }

        // Generate signed URLs for all library items
        const assetsWithUrls = await Promise.all(
            (assets || []).map(async (asset: any) => {
                const { data } = await supabase.storage
                    .from('media')
                    .createSignedUrl(asset.storage_key, 60 * 60 * 24);
                
                return {
                    ...asset,
                    signed_url: data?.signedUrl
                };
            })
        );

        return NextResponse.json(assetsWithUrls);

    } catch (error) {
        console.error('SDK media error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
