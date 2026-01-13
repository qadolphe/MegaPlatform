import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, storeId, role } = await req.json();

        if (!email || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify ownership/permission
        // Only owners can add collaborators (based on schema policies seen earlier)
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('id', storeId)
            .eq('owner_id', user.id)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Unauthorized: Only owners can manage team' }, { status: 403 });
        }

        // Initialize Admin Client
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let targetUserId: string | null = null;
        let isNewUser = false;

        // 1. Check if user exists
        // We can't easily search by email with admin client without listUsers which is heavy, 
        // OR we can try to get user by email if there's a specific method. 
        // Actually, listUsers can filter. 
        // But a simpler way: The RPC `get_user_id_by_email` is available to the authenticated user (us).
        // Let's use the USER client (supabase) to check existence cheaply first.
        
        const { data: existingUserId } = await supabase
            .rpc('get_user_id_by_email', { email_param: email })
            .single();
        
        if (existingUserId) {
            targetUserId = existingUserId as unknown as string;
        } else {
            // 2. If not exists, Invite User via Admin
            // This creates the user in auth.users and sends an invite email.
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
            
            if (inviteError) {
                console.error("Invite Error:", inviteError);
                return NextResponse.json({ error: inviteError.message }, { status: 400 });
            }
            targetUserId = inviteData.user.id;
            isNewUser = true;
        }

        if (!targetUserId) {
             return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 });
        }

        // 3. Add to store_collaborators using RPC (more reliable for RLS issues)
        // This function is security definer and checks ownership internally using the user's auth session
        const { error: insertError } = await supabase
            .rpc('add_store_collaborator', {
                target_store_id: storeId,
                target_user_id: targetUserId,
                target_role: role || 'editor'
            });

        if (insertError) {
            console.error("Insert Error:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, isNewUser });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
