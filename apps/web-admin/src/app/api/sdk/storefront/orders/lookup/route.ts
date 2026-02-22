import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DISPLAY_ID_REGEX = /^ORD-[A-Z0-9]{8}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_PREFIX_REGEX = /^[0-9a-f-]{6,36}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawDisplayId = searchParams.get('display_id');
  const rawEmail = searchParams.get('email');

  if (!rawDisplayId || !rawEmail) {
    return NextResponse.json({ error: 'Missing display_id or email' }, { status: 400 });
  }

  const displayIdInput = rawDisplayId.trim().replace(/^#/, '');
  if (displayIdInput.length < 6 || displayIdInput.length > 36) {
    return NextResponse.json({ error: 'Invalid order identifier format' }, { status: 400 });
  }

  const normalizedDisplayId = displayIdInput.toUpperCase();
  const normalizedUuidCandidate = displayIdInput.toLowerCase();
  const normalizedEmail = rawEmail.trim().toLowerCase();

  if (normalizedEmail.length < 3 || normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const isDisplayId = DISPLAY_ID_REGEX.test(normalizedDisplayId);
  const isFullUuid = UUID_REGEX.test(normalizedUuidCandidate);
  const isUuidPrefix = UUID_PREFIX_REGEX.test(normalizedUuidCandidate);

  if (!isDisplayId && !isFullUuid && !isUuidPrefix) {
    return NextResponse.json({ error: 'Invalid order identifier format' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Lookup service unavailable' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', normalizedEmail)
    .limit(50);

  if (customersError) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  const customerIds = customers?.map((customer) => customer.id) ?? [];

  if (customerIds.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const baseSelect = '*, order_items(*), customers!inner(email)';

  if (isDisplayId) {
    const { data: displayOrder } = await supabase
      .from('orders')
      .select(baseSelect)
      .eq('display_id', normalizedDisplayId)
      .in('customer_id', customerIds)
      .single();

    if (displayOrder) {
      return NextResponse.json(displayOrder);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: fullIdOrder } = await supabase
    .from('orders')
    .select(baseSelect)
    .eq('id', normalizedUuidCandidate)
    .in('customer_id', customerIds)
    .single();

  if (fullIdOrder) {
    return NextResponse.json(fullIdOrder);
  }

  let prefixOrder: any = null;
  if (isUuidPrefix) {
    const { data: prefixOrders } = await supabase
      .from('orders')
      .select(baseSelect)
      .ilike('id', `${normalizedUuidCandidate}%`)
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })
      .limit(1);

    prefixOrder = prefixOrders?.[0] ?? null;
  }

  if (!prefixOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(prefixOrder);
}
