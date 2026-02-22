import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const displayId = searchParams.get('display_id');
  const email = searchParams.get('email');

  if (!displayId || !email) {
    return NextResponse.json({ error: 'Missing display_id or email' }, { status: 400 });
  }

  const supabase = await createClient();

  // Query using the short ID and the customer's email (Security Check)
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), customers!inner(email)')
    .eq('display_id', displayId)
    .eq('customers.email', email) // Crucial: prevents people from guessing short IDs
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
