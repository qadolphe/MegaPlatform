"use client";

import { CreditCard } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function CheckoutDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-8 w-8 text-green-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Checkout API</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Generate secure Stripe checkout sessions.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create Checkout Session</h2>
                <p className="text-slate-600 mb-4">
                    Converts a Cart into a Stripe Checkout URL. Redirect the user to this URL to complete payment.
                </p>
                
                <CodeBlock
                    title="Initiate Checkout"
                    code={`const session = await swat.checkout.create(cartId, {
  successUrl: 'https://mystore.com/success',
  cancelUrl: 'https://mystore.com/cart'
});

// Redirect user to payment page
window.location.href = session.url;`}
                />

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                     <h3 className="text-sm font-bold text-yellow-800 mb-2">Prerequisites</h3>
                     <p className="text-sm text-yellow-700">
                        You must connect your Stripe account in the <strong>Billing</strong> tab of the dashboard before this API will work.
                        Transactions will fail if no payment provider is configured.
                     </p>
                </div>
            </section>
        </div>
    );
}
