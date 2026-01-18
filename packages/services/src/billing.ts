import Stripe from 'stripe';
import { supabase } from '@repo/database';

const stripeLive = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const stripeTest = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Helper to get the correct client
const getStripeClient = (isTestMode = false) => isTestMode ? stripeTest : stripeLive;

export const createConnectAccount = async (email: string) => {
  // Always use Live client for creating accounts (Connect platform is typically one environment)
  // Or if you want test accounts, you might use test key. 
  // Usually, Standard accounts are created on Live mode platform.
  try {
    const account = await stripeLive.accounts.create({
      type: 'standard', 
      email,
    });
    return account;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
};

export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  try {
    const accountLink = await stripeLive.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
};


export const createCheckoutSession = async ({
  storeId,
  stripeAccountId,
  lineItems,
  successUrl,
  cancelUrl,
  applicationFeeAmount, // In cents
  customerEmail,
  metadata,
}: {
  storeId: string;
  stripeAccountId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineItems: any[];
  successUrl: string;
  cancelUrl: string;
  applicationFeeAmount: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) => {
  try {
    // Look up the store mode from database
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('is_test_mode')
      .eq('id', storeId)
      .single();

    if (storeError || !store) throw new Error('Store not found');

    const stripe = getStripeClient(!!store.is_test_mode);
    
    // Note: When calling connected accounts in Test Mode, 
    // the platform must also use its Test Mode secret key.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        storeId,
        ...metadata,
      },
    }, {
      stripeAccount: stripeAccountId,
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const constructEvent = (payload: string | Buffer, signature: string, secret: string) => {
  try {
    // We try with live first as it's the most common
    return stripeLive.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    try {
      // Fallback to test if live fails
      return stripeTest.webhooks.constructEvent(payload, signature, secret);
    } catch (innerError) {
      console.error('Error constructing webhook event:', innerError);
      throw innerError;
    }
  }
};

export const retrieveAccount = async (accountId: string) => {
    try {
        return await stripeLive.accounts.retrieve(accountId);
    } catch (error) {
        console.error('Error retrieving account:', error);
        throw error;
    }
}

export const createLoginLink = async (accountId: string) => {
  try {
    const loginLink = await stripeLive.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
};
