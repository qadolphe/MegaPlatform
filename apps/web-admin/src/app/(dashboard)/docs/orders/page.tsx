"use client";

import { ClipboardList } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function OrdersDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Orders & Fulfillment</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Manage orders and orchestrate complex fulfillment workflows.
                </p>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                    <strong>Admin Only:</strong> These methods require your Secret API Key (`sk_live_...`). 
                    Never use these in front-end client code.
                </div>
            </div>

            {/* List Orders */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                     <h2 className="text-xl font-bold text-slate-900">List Orders</h2>
                </div>
                <p className="text-slate-600 mb-4">Retrieve orders with filtering options.</p>
                
                <CodeBlock
                    title="List pending orders"
                    code={`const orders = await swat.orders.list({
  status: 'pending',
  limit: 20
});`}
                />
            </section>

            {/* Get Order */}
            <section className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                     <h2 className="text-xl font-bold text-slate-900">Get Order Details</h2>
                </div>
                <CodeBlock
                    title="Get single order"
                    code={`const order = await swat.orders.get('ord_123abc');
console.log(order.items, order.shipping_address);`}
                />
            </section>

             {/* Update Order */}
             <section className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">PATCH</span>
                     <h2 className="text-xl font-bold text-slate-900">Update Order</h2>
                </div>
                <CodeBlock
                    title="Update status"
                    code={`await swat.orders.update('ord_123abc', {
  status: 'shipped',
  fulfillment_status: 'fulfilled',
  metafields: [
      { key: 'tracking_number', value: '1Z999...' }
  ]
});`}
                />
            </section>

            {/* Fulfillment Transition */}
            <section className="pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">POST</span>
                     <h2 className="text-xl font-bold text-slate-900">Orchestrate Fulfillment</h2>
                </div>
                <p className="text-slate-600 mb-4">
                    Move a specific order item to the next step in its fulfillment pipeline. 
                    This triggers webhooks and updates the audit log.
                </p>
                
                <CodeBlock
                    title="Transition Item Step"
                    code={`// Example: Completing a 'Quality Check' step
const updatedItem = await swat.orders.transitionItem(
    'ord_123abc', // Order ID
    'item_789',   // Item ID
    {
        stepId: 'step_qa_passed',
        metadata: {
            inspector_name: 'John Doe',
            qa_score: 98
        }
    }
);

console.log('New Step:', updatedItem.current_step_id);`}
                />
            </section>
        </div>
    );
}
