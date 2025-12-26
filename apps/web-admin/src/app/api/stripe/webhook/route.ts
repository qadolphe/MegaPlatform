import { NextResponse } from 'next/server';
import { billing } from '@repo/services';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = billing.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Use Service Role for admin access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === 'account.updated') {
    const account = event.data.object;
    if (account.details_submitted) {
        const { error } = await supabase
            .from('stores')
            .update({ stripe_details_submitted: true })
            .eq('stripe_account_id', account.id);
            
        if (error) console.error('Error updating store status:', error);
    }
  }

  return NextResponse.json({ received: true });
}
