"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({ code, language = "typescript", title }: { code: string; language?: string; title?: string }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 my-4">
            {title && (
                 <div className="px-4 py-2 border-b border-slate-200 bg-white text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {title}
                 </div>
            )}
            <div className="relative group">
                <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-800 leading-relaxed custom-scrollbar">
                    <code>{code}</code>
                </pre>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm border border-slate-200 hover:bg-white rounded-md text-slate-500 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Copy code"
                >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}
