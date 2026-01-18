import { NextResponse } from 'next/server';
import { billing } from '@repo/services';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const mode = searchParams.get('mode') || 'live';
    const isTestMode = mode === 'test';
    
    if (!storeId) {
        return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: store } = await supabase
        .from('stores')
        .select('id, stripe_account_id, stripe_account_id_test')
        .eq('id', storeId)
        .single();

    const accountId = isTestMode ? store?.stripe_account_id_test : store?.stripe_account_id;

    if (!store || !accountId) {
         return NextResponse.redirect(new URL(`/store/${storeId}/settings?error=stripe_config_missing`, request.url));
    }

    // Check status with Stripe
    const account = await billing.retrieveAccount(accountId, isTestMode);
    
    if (account.details_submitted) {
        const updateData = isTestMode 
            ? { stripe_details_submitted_test: true }
            : { stripe_details_submitted: true };

        await supabase
            .from('stores')
            .update(updateData)
            .eq('id', storeId);
    }

    return NextResponse.redirect(new URL(`/store/${storeId}/settings?tab=billing&stripe_connected=true`, request.url));

  } catch (error) {
    console.error('Error in stripe return:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
