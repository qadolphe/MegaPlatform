import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keyId } = await request.json();

        if (!keyId) {
            return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
        }

        // Get the key to verify ownership
        const { data: apiKey } = await supabase
            .from('api_keys')
            .select('store_id')
            .eq('id', keyId)
            .single();

        if (!apiKey) {
            return NextResponse.json({ error: 'API key not found' }, { status: 404 });
        }

        // Verify user owns the store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('id', apiKey.store_id)
            .eq('owner_id', user.id)
            .single();

        if (!store) {
            // Check collaborator access
            const { data: collab } = await supabase
                .from('store_collaborators')
                .select('id')
                .eq('store_id', apiKey.store_id)
                .eq('user_id', user.id)
                .single();

            if (!collab) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        }

        // Revoke the key (soft delete)
        const { error: updateError } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId);

        if (updateError) {
            console.error('Error revoking API key:', updateError);
            return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API key revocation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
