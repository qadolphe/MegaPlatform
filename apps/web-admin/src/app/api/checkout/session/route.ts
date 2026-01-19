import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { billing } from '@repo/services';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
        }

        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Supabase environment variables not configured');
            return NextResponse.json({ error: 'Database service not configured' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const headersList = await headers();
        let host = headersList.get('host') || '';
        host = host.split(':')[0]; // Remove port

        // Determine subdomain
        let subdomain: string | null = null;
        if (host.includes('localhost')) {
            const parts = host.split('.');
            if (parts.length > 1 && parts[0] !== 'localhost') {
                subdomain = parts[0];
            }
        } else if (host.includes('hoodieplatform.com') || host.includes('swatbloc.com')) {
           const parts = host.split('.');
           if (parts.length >= 3) {
               subdomain = parts[0];
           }
        }

        if (!subdomain) {
            console.log('No subdomain found, checking custom domain:', host);
        }

        // Fetch store
        let query = supabase.from('stores').select('id, subdomain, stripe_account_id, stripe_account_id_test');
        
        if (subdomain) {
            query = query.eq('subdomain', subdomain);
        } else {
            query = query.eq('custom_domain', host);
        }

        const { data: store, error: storeError } = await query.single();

        if (storeError || !store) {
            console.error('Store lookup failed:', storeError);
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Determine mode from session ID prefix
        const isTestMode = sessionId.startsWith('cs_test_');

        const stripeAccountId = isTestMode ? store.stripe_account_id_test : store.stripe_account_id;

        console.log(`Retrieving Session for Store: ${store.id} (${store.subdomain})`);
        console.log(`Session ID: ${sessionId}`);
        console.log(`Detected Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
        console.log(`Target Stripe Account: ${stripeAccountId}`);

        if (!stripeAccountId) {
            console.error(`Stripe account ID missing for store ${store.id} (Test Mode: ${isTestMode})`);
             return NextResponse.json({ error: 'Stripe not configured for this store' }, { status: 400 });
        }

        const session = await billing.retrieveCheckoutSession(sessionId, stripeAccountId.trim(), isTestMode);

        return NextResponse.json(session);

    } catch (error: any) {
        console.error('Error retrieving checkout session:', error);
        
        if (error.code === 'resource_missing' || error.statusCode === 404) {
             return NextResponse.json({ error: 'Session not found', details: error.message }, { status: 404 });
        }

        return NextResponse.json(
            { 
                error: error.message || 'Failed to retrieve session',
                code: error.code,
                type: error.type,
                statusCode: error.statusCode,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 
            { status: 500 }
        );
    }
}
