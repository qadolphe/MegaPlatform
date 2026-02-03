import { NextResponse } from 'next/server';
import { billing } from '@repo/services';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { storeId, env } = await request.json(); // env: 'live' | 'test'
    const isTestMode = env === 'test';
    
    const supabase = await createClient();

    // 1. Check ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id, stripe_account_id, stripe_account_id_test, owner_id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    let accountId = isTestMode ? store.stripe_account_id_test : store.stripe_account_id;

    // 2. Create Stripe Account if not exists
    if (!accountId) {
      const account = await billing.createConnectAccount(user.email || '', isTestMode);
      accountId = account.id;

      // Save to DB
      const updateData = isTestMode 
        ? { stripe_account_id_test: accountId } 
        : { stripe_account_id: accountId };

      await supabase
        .from('stores')
        .update(updateData)
        .eq('id', storeId);
    }

    // 3. Check if account is already fully onboarded
    // We can check the DB flag 'stripe_details_submitted' or query Stripe directly.
    // Querying Stripe is safer to ensure we have the latest status.
    const account = await billing.retrieveAccount(accountId, isTestMode);

    if (account.details_submitted) {
        // Standard accounts do not support Login Links; they log in directly to Stripe.
        if (account.type === 'standard') {
             const dashboardUrl = isTestMode 
                ? 'https://dashboard.stripe.com/test/dashboard' 
                : 'https://dashboard.stripe.com/dashboard';
             return NextResponse.json({ url: dashboardUrl });
        }

        // If Express/Custom, generate a Login Link to the Express Dashboard
        try {
          const loginLink = await billing.createLoginLink(accountId, isTestMode);
          return NextResponse.json({ url: loginLink.url });
        } catch (err: any) {
           console.error('Failed to generate login link:', err);
           // Fallback to generic dashboard if link creation fails (e.g. incompatible account type that isn't standard)
           const dashboardUrl = isTestMode 
                ? 'https://dashboard.stripe.com/test/dashboard' 
                : 'https://dashboard.stripe.com/dashboard';
           return NextResponse.json({ url: dashboardUrl });
        }
    }

    // 4. Create Account Link (Onboarding)
    // Determine base URL (dev vs prod)
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'swatbloc.com';
    const baseUrl = `${protocol}://${host}`;
    
    const returnUrl = `${baseUrl}/api/stripe/return?storeId=${storeId}&mode=${isTestMode ? 'test' : 'live'}`;
    const refreshUrl = `${baseUrl}/store/${storeId}/settings?tab=billing`; 

    const accountLink = await billing.createAccountLink(accountId, refreshUrl, returnUrl, isTestMode);

    return NextResponse.json({ url: accountLink.url });


  } catch (error) {
    console.error('Error in stripe connect:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
