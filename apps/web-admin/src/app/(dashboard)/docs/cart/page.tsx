"use client";

import { ShoppingCart } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function CartDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Cart API</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Manage shopping carts, add items, and update quantities.
                </p>
            </div>

            {/* Create Cart */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create Cart</h2>
                <p className="text-slate-600 mb-4">Initialize a new cart session, optionally with starting items.</p>
                
                <CodeBlock
                    title="Initialize empty cart"
                    code={`const cart = await swat.cart.create([]); 
// Store cart.id in localStorage for persistence`}
                />
                
                 <CodeBlock
                    title="Initialize with items"
                    code={`const cart = await swat.cart.create([
  { productId: 'prod_123', quantity: 1 },
  { productId: 'prod_456', quantity: 2 }
]);`}
                />
            </section>

             {/* Get Cart */}
             <section className="pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Get Cart</h2>
                <p className="text-slate-600 mb-4">Retrieve current cart state. Useful on page load.</p>
                
                <CodeBlock
                    code={`const cartId = localStorage.getItem('cart_id');
if (cartId) {
  const cart = await swat.cart.get(cartId);
}`}
                />
            </section>

            {/* Add Items */}
            <section className="pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Add Items</h2>
                <p className="text-slate-600 mb-4">Add one or more products to an existing cart.</p>
                
                <CodeBlock
                    code={`const updatedCart = await swat.cart.addItems(cartId, [
  { productId: 'prod_789', quantity: 1 }
]);`}
                />
            </section>

            {/* Update Item */}
            <section className="pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Update Quantity</h2>
                
                <CodeBlock
                    code={`// Set quantity to 5
const updatedCart = await swat.cart.updateItem(cartId, 'prod_123', 5);`}
                />
            </section>

            {/* Remove Item */}
            <section className="pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Remove Item</h2>
                
                <CodeBlock
                    code={`const updatedCart = await swat.cart.removeItem(cartId, 'prod_123');`}
                />
            </section>
        </div>
    );
}
