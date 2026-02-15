"use client";

import { Paperclip } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function MediaDocsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Paperclip className="h-8 w-8 text-pink-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Content Library (Media)</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Access images, videos, and other assets uploaded to your store's dashboard.
                </p>
            </div>

            {/* List Media */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
                     <h2 className="text-xl font-bold text-slate-900">List Assets</h2>
                </div>
                <p className="text-slate-600 mb-4">Retrieve media assets, useful for building custom galleries or using cms-managed content.</p>
                
                <CodeBlock
                    title="List all media"
                    code={`// Fetch all images/videos
const media = await swat.media.list();

media.forEach(asset => {
    console.log(asset.filename, asset.url);
});`}
                />

                 <CodeBlock
                    title="Search & Pagination"
                    code={`// Search for specific campaigns
const campaignAssets = await swat.media.list({
    search: 'summer-sale-2026',
    limit: 5
});`}
                />
            </section>
        </div>
    );
}
