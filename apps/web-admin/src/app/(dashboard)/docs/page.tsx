"use client";

import { Terminal } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function DocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Getting Started</h1>
                <p className="text-lg text-slate-600">
                    Learn how to install and configure the SwatBloc SDK to build custom storefronts.
                </p>
            </div>

            <div className="prose prose-slate max-w-none">
                <p>
                    The SwatBloc SDK provides a type-safe interface to your store's backend. 
                    It handles authentication, product retrieval, cart management, and checkout flows, 
                    allowing you to focus on building the best user experience.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Terminal size={20} className="text-blue-600" />
                    Installation
                </h2>
                <div className="space-y-4">
                    <p className="text-slate-600">Install the package via npm, pnpm, or yarn:</p>
                    <CodeBlock code="npm install @swatbloc/sdk" language="bash" />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Initialization</h2>
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Import the client and initialize it with your public API Key. 
                        You can find your API key in the <strong>Developer</strong> tab of your store settings.
                    </p>
                    <CodeBlock
                        title="store.ts"
                        code={`import { SwatBloc } from '@swatbloc/sdk';

// Initialize the client
// We recommend using an environment variable for the key
export const swat = new SwatBloc(process.env.NEXT_PUBLIC_SWATBLOC_KEY);`}
                    />
                    
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                        <strong>Note:</strong> The SDK is designed to be safe for client-side use. 
                        It uses a public key (`pk_live_...`) that only allows safe operations like fetching products 
                        and creating carts. Never expose your secret service role keys in frontend code.
                    </div>
                </div>
            </section>
        </div>
    );
}
