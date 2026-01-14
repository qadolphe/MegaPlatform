import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use a fixed version for stability
});

export const createConnectAccount = async (email: string) => {
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

export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
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
}: {
  storeId: string;
  stripeAccountId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineItems: any[];
  successUrl: string;
  cancelUrl: string;
  applicationFeeAmount: number;
  customerEmail?: string;
}) => {
  try {
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
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
};

export const retrieveAccount = async (accountId: string) => {
    try {
        return await stripe.accounts.retrieve(accountId);
    } catch (error) {
        console.error('Error retrieving account:', error);
        throw error;
    }
}

export const createLoginLink = async (accountId: string) => {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
};
