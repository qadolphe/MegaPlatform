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

export const createConnectAccount = async (email: string, isTestMode = false) => {
  const stripe = getStripeClient(isTestMode);
  try {
    const account = await stripe.accounts.create({
      type: 'standard',
      email,
    });
    return account;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
};

export const createAccountLink = async (
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
  isTestMode = false
) => {
  const stripe = getStripeClient(isTestMode);
  try {
    const accountLink = await stripe.accountLinks.create({
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
  isTestMode = false
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
  isTestMode?: boolean;
}) => {
  try {
    console.log(`[Billing] Creating checkout session for store ${storeId}. Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
    
    const stripe = getStripeClient(isTestMode);
    
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

export const retrieveAccount = async (accountId: string, isTestMode = false) => {
  const stripe = getStripeClient(isTestMode);
  try {
    return await stripe.accounts.retrieve(accountId);
  } catch (error) {
    console.error('Error retrieving account:', error);
    throw error;
  }
}

export const createLoginLink = async (accountId: string, isTestMode = false) => {
  const stripe = getStripeClient(isTestMode);
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
};
