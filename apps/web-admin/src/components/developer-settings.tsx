"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Copy, Loader2, Key, Check, Code2, Beaker } from "lucide-react";
import { CURSOR_RULES_FALLBACK } from "@repo/config";
import { StoreSettings } from "./settings/types";

interface ApiKey {
    id: string;
    name: string;
    public_key: string;
    secret_key: string;
    created_at: string;
    is_active: boolean;
}

interface DeveloperSettingsProps {
    storeId: string;
    settings?: StoreSettings | null;
    saveSettings?: (updates: Partial<StoreSettings>) => Promise<boolean>;
    saving?: boolean;
}

export function DeveloperSettings({ storeId, settings, saveSettings, saving = false }: DeveloperSettingsProps) {
    const supabase = createClient();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ publicKey: string; secretKey: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [cursorRules, setCursorRules] = useState(CURSOR_RULES_FALLBACK);

    useEffect(() => {
        fetchApiKeys();
        
        // Fetch the latest rules from the API (which reads the file system in dev)
        fetch('/api/cursor-rules')
            .then(res => res.json())
            .then(data => {
                if (data.content) setCursorRules(data.content);
            })
            .catch(err => console.error("Failed to fetch cursor rules", err));
    }, [storeId]);

    const fetchApiKeys = async () => {
        const { data } = await supabase
            .from("api_keys")
            .select("*")
            .eq("store_id", storeId)
            .eq("is_active", true)
            .order("created_at", { ascending: false });
        if (data) setApiKeys(data);
    };

    const handleGenerateApiKey = async () => {
        setGeneratingKey(true);
        // This would typically call an API endpoint to generate keys securely
        // For now simulating a call to our API route
        try {
            const res = await fetch('/api/keys/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, name: newKeyName || 'Default Key' })
            });
            const data = await res.json();
            if (data.success) {
                setNewlyCreatedKey(data.key);
                fetchApiKeys();
                setNewKeyName("");
            }
        } catch (e) {
            console.error(e);
        }
        setGeneratingKey(false);
    };

    const handleRevokeApiKey = async (id: string) => {
        if (!confirm("Are you sure? Any apps using this key will stop working.")) return;
        await supabase
            .from("api_keys")
            .update({ is_active: false })
            .eq("id", id);
        fetchApiKeys();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const maskKey = (key: string) => {
        return key.slice(0, 8) + "•".repeat(20) + key.slice(-4);
    };

    return (
        <div className="space-y-6">
            {/* Store Environment */}
            {settings && saveSettings && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-orange-100 p-2 rounded-lg text-orange-600">
                                <Beaker size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                                    Test Mode
                                    {settings?.is_test_mode && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Active</span>}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Enable to use test Stripe keys and simulate transactions without real charges.<br/>
                                    <span className="text-xs text-orange-600 font-medium">Warning: This affects all checkouts for this store.</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => saveSettings({ is_test_mode: !settings?.is_test_mode })}
                            disabled={saving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                settings?.is_test_mode ? 'bg-orange-500' : 'bg-slate-200'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings?.is_test_mode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* Cursor Rules */}
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl relative group">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white flex items-center gap-2">
                        <span className="bg-white/10 p-1 rounded"><Code2 size={16} className="text-blue-400" /></span>
                        Cursor AI Rules
                    </h3>
                    <button 
                        onClick={() => copyToClipboard(cursorRules)} 
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition border border-transparent hover:border-slate-600 flex items-center gap-2 text-xs"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Rules'}
                    </button>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                    Copy these rules into a <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300 text-xs">.cursorrules</code> file in your project root to teach Cursor AI how to use the SwatBloc SDK.
                </p>
                <div className="relative">
                    <pre className="text-xs text-slate-300 font-mono bg-black/50 p-4 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {cursorRules}
                    </pre>
                </div>
            </div>

            {/* Generate New Key */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Key size={18} className="text-blue-600" />
                    Generate New API Key
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g., 'Production', 'Development')"
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                        onClick={handleGenerateApiKey}
                        disabled={generatingKey}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {generatingKey ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                        Generate Key
                    </button>
                </div>
            </div>

            {/* Newly Created Key Alert */}
            {newlyCreatedKey && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Check size={20} className="text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-green-800 mb-3">Your new API key is ready!</h4>
                            <p className="text-sm text-green-700 mb-4">Save your secret key now. For security, it won't be shown again.</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-green-700 mb-1 block">Public Key</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm font-mono">{newlyCreatedKey.publicKey}</code>
                                        <button onClick={() => copyToClipboard(newlyCreatedKey.publicKey)} className="p-2 text-green-600 hover:bg-green-100 rounded"><Copy size={16} /></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-green-700 mb-1 block">Secret Key ⚠️ Copy now!</label>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm font-mono">{newlyCreatedKey.secretKey}</code>
                                        <button onClick={() => copyToClipboard(newlyCreatedKey.secretKey)} className="p-2 text-green-600 hover:bg-green-100 rounded"><Copy size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Keys */}
            <div>
                <h3 className="font-medium text-slate-900 mb-3">Active API Keys</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {apiKeys.length === 0 ? (
                        <div className="p-8 text-center">
                            <Code2 size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm text-slate-500">No API keys yet</p>
                            <p className="text-xs text-slate-400">Generate your first key to get started</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="p-4 bg-white hover:bg-slate-50 transition">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-medium text-slate-900">{key.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">Created {new Date(key.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeApiKey(key.id)}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <label className="text-xs text-slate-500">Public Key</label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-2 py-1.5 bg-slate-100 rounded text-xs font-mono truncate">{key.public_key}</code>
                                                <button onClick={() => copyToClipboard(key.public_key)} className="p-1 text-slate-400 hover:text-slate-600"><Copy size={14} /></button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Secret Key</label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-2 py-1.5 bg-slate-100 rounded text-xs font-mono">{maskKey(key.secret_key)}</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* SDK Installation */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h3 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                    <Code2 size={18} />
                    Quick Start with SDK
                </h3>
                <p className="text-sm text-indigo-700 mb-3">Install the SwatBloc SDK to access your store's products and checkout from any app.</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                    <div className="text-slate-400">// Install the SDK</div>
                    <div className="text-green-400">npm install @swatbloc/sdk</div>
                    <div className="text-slate-400 mt-3">// Use in your app</div>
                    <div className="text-blue-300">import {'{'} SwatBloc {'}'} from '@swatbloc/sdk';</div>
                    <div className="text-white">const swat = new SwatBloc('pk_live_...');</div>
                    <div className="text-white">const products = await swat.products.list();</div>
                </div>
            </div>
        </div>
    );
}
