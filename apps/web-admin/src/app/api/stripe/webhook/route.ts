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

  switch (event.type) {
    case 'account.updated': {
      const account = event.data.object;
      if (account.details_submitted) {
        const { error } = await supabase
          .from('stores')
          .update({ stripe_details_submitted: true })
          .eq('stripe_account_id', account.id);

        if (error) console.error('Error updating store status:', error);
      }
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object;
      const storeId = session.metadata?.storeId;
      const itemsJson = session.metadata?.items;

      if (!storeId) {
        console.error('No storeId in session metadata');
        break;
      }

      try {
        // Parse items from metadata
        const cartItems = itemsJson ? JSON.parse(itemsJson) : [];

        // Get customer email from session
        const customerEmail = session.customer_details?.email;

        // Find or create customer
        let customerId: string | null = null;
        if (customerEmail) {
          // Try to find existing customer
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('store_id', storeId)
            .eq('email', customerEmail)
            .single();

          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            // Create new customer
            const { data: newCustomer } = await supabase
              .from('customers')
              .insert({
                store_id: storeId,
                email: customerEmail,
                first_name: session.customer_details?.name?.split(' ')[0] || null,
                last_name: session.customer_details?.name?.split(' ').slice(1).join(' ') || null,
              })
              .select('id')
              .single();

            customerId = newCustomer?.id || null;
          }
        }

        // Calculate amounts
        const subtotalAmount = session.amount_subtotal || 0;
        const totalAmount = session.amount_total || 0;
        const shippingAmount = 0; // TODO: Add shipping support

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            store_id: storeId,
            customer_id: customerId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
            subtotal_amount: subtotalAmount,
            shipping_amount: shippingAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            currency: session.currency || 'usd',
            status: 'paid',
            payment_status: 'paid',
            fulfillment_status: 'unfulfilled',
            shipping_address: session.shipping_details?.address || null,
            billing_address: session.customer_details?.address || null,
          })
          .select('id')
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          break;
        }

        // Create order items
        if (order && cartItems.length > 0) {
          // Fetch product details for the items
          const productIds = cartItems.map((item: any) => item.id);
          const { data: products } = await supabase
            .from('products')
            .select('id, title, images')
            .in('id', productIds);

          const productMap = new Map(products?.map(p => [p.id, p]) || []);

          const orderItems = cartItems.map((item: any) => {
            const product = productMap.get(item.id);
            return {
              order_id: order.id,
              product_id: item.id,
              quantity: item.qty,
              price_at_purchase: item.price,
              product_name: product?.title || 'Unknown Product',
              image_url: product?.images?.[0] || null,
            };
          });

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('Error creating order items:', itemsError);
          }
        }

      } catch (error) {
        console.error('Error processing checkout session:', error);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

