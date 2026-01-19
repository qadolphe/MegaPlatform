import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing env vars. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    console.error('Usage: source .env && npx tsx apps/web-admin/scripts/verify-webhook.ts');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('Checking recent orders in database...');
    
    // Check connection
    const { count, error: countError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    if (countError) {
        console.error('Error connecting to Supabase:', countError);
        return;
    }
    console.log(`Total orders in DB: ${count}`);

    // Fetch recent
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, stripe_checkout_session_id, created_at, total_amount, status, payment_status')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching recent orders:', error);
        return;
    }

    if (orders.length === 0) {
        console.log('No specific orders found.');
    } else {
        console.table(orders);
    }
}

main().catch(console.error);
