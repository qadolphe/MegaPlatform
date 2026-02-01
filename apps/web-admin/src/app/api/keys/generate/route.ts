import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateKey(prefix: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = prefix;
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { storeId, name = 'Default', isTest = false } = await request.json();

        if (!storeId) {
            return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
        }

        // Verify user owns this store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('id', storeId)
            .eq('owner_id', user.id)
            .single();

        if (!store) {
            // Check if collaborator
            const { data: collab } = await supabase
                .from('store_collaborators')
                .select('id')
                .eq('store_id', storeId)
                .eq('user_id', user.id)
                .single();

            if (!collab) {
                return NextResponse.json({ error: 'Store not found or access denied' }, { status: 403 });
            }
        }

        // Generate keys
        const publicKey = generateKey(isTest ? 'pk_test_' : 'pk_live_');
        const secretKey = generateKey(isTest ? 'sk_test_' : 'sk_live_');

        // Insert into database
        const { data: apiKey, error: insertError } = await supabase
            .from('api_keys')
            .insert({
                store_id: storeId,
                public_key: publicKey,
                secret_key: secretKey,
                name,
                is_test: isTest
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating API key:', insertError);
            return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
        }

        // Return the full keys (only time secret is shown in full)
        return NextResponse.json({
            success: true,
            key: {
                id: apiKey.id,
                name: apiKey.name,
                publicKey,
                secretKey,
                createdAt: apiKey.created_at
            }
        });

    } catch (error) {
        console.error('API key generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
