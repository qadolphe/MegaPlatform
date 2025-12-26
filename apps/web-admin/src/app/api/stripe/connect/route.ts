import { NextResponse } from 'next/server';
import { billing } from '@repo/services';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { storeId } = await request.json();
    const supabase = await createClient();

    // 1. Check ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id, stripe_account_id, owner_id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    let accountId = store.stripe_account_id;

    // 2. Create Stripe Account if not exists
    if (!accountId) {
      const account = await billing.createConnectAccount(user.email || '');
      accountId = account.id;

      // Save to DB
      await supabase
        .from('stores')
        .update({ stripe_account_id: accountId })
        .eq('id', storeId);
    }

    // 3. Check if account is already fully onboarded
    // We can check the DB flag 'stripe_details_submitted' or query Stripe directly.
    // Querying Stripe is safer to ensure we have the latest status.
    const account = await billing.retrieveAccount(accountId);

    if (account.details_submitted) {
        // If fully onboarded, generate a Login Link to the Express Dashboard
        const loginLink = await billing.createLoginLink(accountId);
        return NextResponse.json({ url: loginLink.url });
    }

    // 4. Create Account Link (Onboarding)
    // Determine base URL (dev vs prod)
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'swatbloc.com';
    const baseUrl = `${protocol}://${host}`;
    
    const returnUrl = `${baseUrl}/api/stripe/return?storeId=${storeId}`;
    const refreshUrl = `${baseUrl}/store/${storeId}/settings`; // Or a dedicated error page

    const accountLink = await billing.createAccountLink(accountId, refreshUrl, returnUrl);

    return NextResponse.json({ url: accountLink.url });

  } catch (error) {
    console.error('Error in stripe connect:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
