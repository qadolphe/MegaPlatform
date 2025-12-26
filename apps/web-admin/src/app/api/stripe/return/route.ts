import { NextResponse } from 'next/server';
import { billing } from '@repo/services';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
        return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch store to get stripe_account_id
    // We don't strictly need auth here as this is a callback, but we should verify the store exists
    // and maybe check if the current user is the owner if we want to be strict, 
    // but the user might have been logged out during the process? 
    // Usually Stripe redirects happen in the same browser session, so cookies should be there.
    
    const { data: store } = await supabase
        .from('stores')
        .select('id, stripe_account_id')
        .eq('id', storeId)
        .single();

    if (!store || !store.stripe_account_id) {
         return NextResponse.redirect(new URL(`/store/${storeId}/settings?error=stripe_config_missing`, request.url));
    }

    // Check status with Stripe
    const account = await billing.retrieveAccount(store.stripe_account_id);
    
    if (account.details_submitted) {
        await supabase
            .from('stores')
            .update({ stripe_details_submitted: true })
            .eq('id', storeId);
    }

    return NextResponse.redirect(new URL(`/store/${storeId}/settings?stripe_connected=true`, request.url));

  } catch (error) {
    console.error('Error in stripe return:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
