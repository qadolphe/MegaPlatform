import { NextResponse } from 'next/server';
import { email } from '@repo/services';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { domain, storeId } = await request.json();
    const supabase = await createClient();

    // 1. Check ownership (and authentication)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    // 2. Call Resend
    const resendDomain = await email.createDomain(domain);

    if (resendDomain.error) {
        return NextResponse.json({ error: resendDomain.error.message }, { status: 400 });
    }

    // 3. Save to DB
    const { error: dbError } = await supabase.from('store_email_domains').insert({
      store_id: storeId,
      domain: domain,
      resend_domain_id: resendDomain.data?.id,
      dns_records: resendDomain.data?.records,
      status: 'pending',
    });

    if (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: resendDomain.data });
  } catch (error) {
    console.error('Error in create domain:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
