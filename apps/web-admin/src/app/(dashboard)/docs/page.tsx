"use client";

import { Code2, Copy, Check, ExternalLink, Package, ShoppingCart, CreditCard, Store, Terminal, Book } from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const CodeBlock = ({ code, language = "typescript", id }: { code: string; language?: string; id: string }) => (
        <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
                <code>{code}</code>
            </pre>
            <button
                onClick={() => copyToClipboard(code, id)}
                className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100"
            >
                {copiedCode === id ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Book className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">SwatBloc SDK</h1>
                        <p className="text-slate-500">Headless commerce for developers</p>
                    </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Build your own custom storefront with Cursor, Lovable, Next.js, or any framework — powered by SwatBloc's backend.
                </p>
            </div>

            {/* Quick Start */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Terminal size={20} className="text-blue-600" />
                    Quick Start
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">1. Install the SDK</p>
                        <CodeBlock code="npm install @swatbloc/sdk" language="bash" id="install" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">2. Initialize with your API key</p>
                        <CodeBlock
                            code={`import { SwatBloc } from '@swatbloc/sdk';

const swat = new SwatBloc('pk_live_YOUR_KEY_HERE');`}
                            id="init"
                        />
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-700">
                            <strong>Get your API key:</strong> Go to any store's Settings → Developer tab to generate your public key.
                        </p>
                    </div>
                </div>
            </section>

            {/* Products API */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package size={20} className="text-purple-600" />
                    Products
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">List all products</h3>
                        <CodeBlock
                            code={`const products = await swat.products.list();

// With options
const products = await swat.products.list({
  limit: 10,
  offset: 0,
  category: 'shoes',
  search: 'running'
});`}
                            id="products-list"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Get a single product</h3>
                        <CodeBlock
                            code={`// By ID
const product = await swat.products.get('prod_123');

// By slug
const product = await swat.products.get('blue-running-shoes');`}
                            id="products-get"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Search products</h3>
                        <CodeBlock
                            code={`const results = await swat.products.search('running shoes');`}
                            id="products-search"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Product type</h3>
                        <CodeBlock
                            code={`interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category: string | null;
  inventory_quantity: number;
  is_active: boolean;
}`}
                            id="product-type"
                        />
                    </div>
                </div>
            </section>

            {/* Cart API */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-green-600" />
                    Cart
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Create a cart</h3>
                        <CodeBlock
                            code={`const cart = await swat.cart.create([
  { productId: 'prod_123', quantity: 2 },
  { productId: 'prod_456', quantity: 1 }
]);

console.log(cart.id);       // 'cart_abc123'
console.log(cart.subtotal); // 99.99`}
                            id="cart-create"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Get & update cart</h3>
                        <CodeBlock
                            code={`// Get existing cart
const cart = await swat.cart.get('cart_abc123');

// Add items
await swat.cart.addItems('cart_abc123', [
  { productId: 'prod_789', quantity: 1 }
]);

// Update quantity
await swat.cart.updateItem('cart_abc123', 'prod_123', 3);

// Remove item
await swat.cart.removeItem('cart_abc123', 'prod_123');`}
                            id="cart-update"
                        />
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-700">
                            <strong>Tip:</strong> Save the cart ID to localStorage so it persists across sessions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Checkout API */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" />
                    Checkout
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Create checkout session</h3>
                        <CodeBlock
                            code={`const checkout = await swat.checkout.create('cart_abc123', {
  successUrl: 'https://mystore.com/success',
  cancelUrl: 'https://mystore.com/cart'
});

// Redirect to Stripe Checkout
window.location.href = checkout.url;`}
                            id="checkout"
                        />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-sm text-slate-600">
                            Checkout sessions are powered by Stripe and expire after 24 hours.
                        </p>
                    </div>
                </div>
            </section>

            {/* Store API */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Store size={20} className="text-indigo-600" />
                    Store Info
                </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Get store details</h3>
                        <CodeBlock
                            code={`const store = await swat.store.info();

console.log(store.name);     // "My Store"
console.log(store.currency); // "usd"
console.log(store.colors);   // { primary: "#3B82F6", ... }`}
                            id="store-info"
                        />
                    </div>
                </div>
            </section>

            {/* Error Handling */}
            <section className="mb-12">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Error Handling</h2>

                <CodeBlock
                    code={`try {
  const product = await swat.products.get('invalid-id');
} catch (error) {
  console.error(error.message);
  // "Product not found: invalid-id"
}`}
                    id="errors"
                />
            </section>

            {/* Security */}
            <section className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl">
                <h2 className="text-xl font-bold text-slate-900 mb-4">🔐 Security</h2>
                <div className="space-y-3 text-sm text-slate-600">
                    <p>• <strong>Public key (pk_live_...)</strong> — Safe to use in client-side code</p>
                    <p>• <strong>Secret key (sk_live_...)</strong> — Never expose in frontend code; use server-side only</p>
                    <p>• Always validate webhook signatures for order notifications</p>
                </div>
            </section>
        </div>
    );
}
