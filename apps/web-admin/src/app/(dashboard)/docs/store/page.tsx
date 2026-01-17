"use client";

import { Store } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function StoreDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-2">
                    <Store className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Store API</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Retrieve public store configuration and metadata.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Get Store Info</h2>
                <p className="text-slate-600 mb-4">
                    Useful for fetching store name, logo, Currency, and global theme settings.
                </p>
                
                <CodeBlock
                    title="Fetch Metadata"
                    code={`const store = await swat.store.info();

console.log(store.name);       // "My Awesome Store"
console.log(store.currency);   // "USD"
console.log(store.logo_url);   // "https://..."`}
                />
            </section>
        </div>
    );
}
