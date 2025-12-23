"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Globe, Palette, CreditCard, Bell, Shield, Check, AlertCircle, Loader2, ExternalLink, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";

interface StoreSettings {
    id: string;
    name: string;
    subdomain: string;
    custom_domain: string | null;
    theme: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    stripe_account_id: string | null;
    stripe_details_submitted: boolean;
    currency: string;
}

type SettingsTab = 'general' | 'domains' | 'theme' | 'billing';

export default function StoreSettingsPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = use(params);
    const supabase = createClient();
    
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Domain verification state
    const [customDomain, setCustomDomain] = useState("");
    const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'verified' | 'pending' | 'error'>('idle');

    // Email Domain state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [emailDomains, setEmailDomains] = useState<any[]>([]);
    const [newEmailDomain, setNewEmailDomain] = useState("");
    const [addingEmailDomain, setAddingEmailDomain] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchEmailDomains();
    }, [storeId]);

    const fetchEmailDomains = async () => {
        const { data } = await supabase
            .from("store_email_domains")
            .select("*")
            .eq("store_id", storeId);
        if (data) setEmailDomains(data);
    };

    const handleAddEmailDomain = async () => {
        if (!newEmailDomain) return;
        setAddingEmailDomain(true);
        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newEmailDomain, storeId }),
            });
            const data = await res.json();
            if (data.success) {
                setNewEmailDomain("");
                fetchEmailDomains();
                setMessage({ type: 'success', text: 'Domain added successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to add domain' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to add domain' });
        } finally {
            setAddingEmailDomain(false);
        }
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .single();
        
        if (error) {
            console.error("Error fetching settings:", error);
            return;
        }
        
        setSettings(data);
        setCustomDomain(data.custom_domain || "");
        setLoading(false);
    };

    const saveSettings = async (updates: Partial<StoreSettings>) => {
        setSaving(true);
        setMessage(null);
        
        const { error } = await supabase
            .from("stores")
            .update(updates)
            .eq("id", storeId);
        
        setSaving(false);
        
        if (error) {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
            return false;
        }
        
        setSettings(prev => prev ? { ...prev, ...updates } : null);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        return true;
    };

    const handleDomainSave = async () => {
        if (!customDomain) {
            await saveSettings({ custom_domain: null });
            setDomainStatus('idle');
            return;
        }
        
        // Basic domain validation
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!domainRegex.test(customDomain)) {
            setMessage({ type: 'error', text: 'Please enter a valid domain name (e.g., mystore.com)' });
            return;
        }
        
        setDomainStatus('checking');
        
        // Save domain to database
        const success = await saveSettings({ custom_domain: customDomain.toLowerCase() });
        
        if (success) {
            setDomainStatus('pending');
        } else {
            setDomainStatus('error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Copied to clipboard!' });
        setTimeout(() => setMessage(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Store not found</p>
            </div>
        );
    }

    const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <Shield size={18} /> },
        { id: 'domains', label: 'Domains', icon: <Globe size={18} /> },
        { id: 'theme', label: 'Theme', icon: <Palette size={18} /> },
        { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Store Settings</h1>
                            <p className="text-sm text-slate-500">{settings.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Message Banner */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-56 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">General Settings</h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Store Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.name}
                                                onChange={(e) => setSettings(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                value={settings.currency}
                                                onChange={(e) => setSettings(prev => prev ? { ...prev, currency: e.target.value } : null)}
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                            >
                                                <option value="usd">USD ($)</option>
                                                <option value="eur">EUR (€)</option>
                                                <option value="gbp">GBP (£)</option>
                                                <option value="cad">CAD ($)</option>
                                                <option value="aud">AUD ($)</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200">
                                            <button
                                                onClick={() => saveSettings({ name: settings.name, currency: settings.currency })}
                                                disabled={saving}
                                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {saving && <Loader2 className="animate-spin" size={16} />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Domains Settings */}
                            {activeTab === 'domains' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Domain Settings</h2>
                                    
                                    <div className="space-y-6">
                                        {/* Default Subdomain */}
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-700">Default Subdomain</span>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600">
                                                    {settings.subdomain}.hoodieplatform.com
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(`${settings.subdomain}.hoodieplatform.com`)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 transition"
                                                    title="Copy"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <a
                                                    href={`https://${settings.subdomain}.hoodieplatform.com`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition"
                                                    title="Visit"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Custom Domain */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Custom Domain
                                            </label>
                                            <p className="text-sm text-slate-500 mb-3">
                                                Connect your own domain to your store. You'll need to configure DNS settings with your domain registrar.
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customDomain}
                                                    onChange={(e) => setCustomDomain(e.target.value)}
                                                    placeholder="mystore.com"
                                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                                <button
                                                    onClick={handleDomainSave}
                                                    disabled={saving || domainStatus === 'checking'}
                                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {domainStatus === 'checking' && <Loader2 className="animate-spin" size={16} />}
                                                    {customDomain ? 'Save' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* DNS Instructions */}
                                        {customDomain && (domainStatus === 'pending' || settings.custom_domain) && (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <h4 className="font-medium text-amber-800 mb-2">DNS Configuration Required</h4>
                                                        <p className="text-sm text-amber-700 mb-3">
                                                            Add the following DNS record with your domain registrar:
                                                        </p>
                                                        <div className="bg-white rounded border border-amber-200 p-3 text-sm font-mono">
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div>
                                                                    <span className="text-slate-500">Type:</span>
                                                                    <span className="ml-2 text-slate-900">CNAME</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">Name:</span>
                                                                    <span className="ml-2 text-slate-900">@</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">Value:</span>
                                                                    <span className="ml-2 text-slate-900">cname.hoodieplatform.com</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-amber-600 mt-2">
                                                            DNS changes can take up to 48 hours to propagate.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Sending Domains */}
                                        <div className="pt-6 border-t border-slate-200">
                                            <h3 className="text-md font-medium text-slate-900 mb-4">Email Sending Domains</h3>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Verify domains to send emails (like order confirmations) from your own brand.
                                            </p>
                                            
                                            {/* List existing domains */}
                                            <div className="space-y-4 mb-6">
                                                {emailDomains.map((domain) => (
                                                    <div key={domain.id} className="border border-slate-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="font-medium text-slate-900">{domain.domain}</div>
                                                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                domain.status === 'verified' ? 'bg-green-100 text-green-700' : 
                                                                domain.status === 'failed' ? 'bg-red-100 text-red-700' : 
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                                                            </div>
                                                        </div>
                                                        
                                                        {domain.status !== 'verified' && domain.dns_records && (
                                                            <div className="bg-slate-50 p-3 rounded text-xs font-mono overflow-x-auto">
                                                                <table className="w-full text-left">
                                                                    <thead>
                                                                        <tr className="text-slate-500">
                                                                            <th className="pb-2">Type</th>
                                                                            <th className="pb-2">Name</th>
                                                                            <th className="pb-2">Value</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                        {domain.dns_records.map((record: any, i: number) => (
                                                                            <tr key={i} className="border-t border-slate-200">
                                                                                <td className="py-2 pr-4">{record.record_type || record.type}</td>
                                                                                <td className="py-2 pr-4">{record.name}</td>
                                                                                <td className="py-2 break-all">{record.value}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add new domain */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newEmailDomain}
                                                    onChange={(e) => setNewEmailDomain(e.target.value)}
                                                    placeholder="marketing.mystore.com"
                                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                                <button
                                                    onClick={handleAddEmailDomain}
                                                    disabled={addingEmailDomain || !newEmailDomain}
                                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {addingEmailDomain && <Loader2 className="animate-spin" size={16} />}
                                                    Add Domain
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Theme Settings */}
                            {activeTab === 'theme' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Theme Settings</h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Animation Style
                                            </label>
                                            <select
                                                value={settings.theme}
                                                onChange={(e) => setSettings(prev => prev ? { ...prev, theme: e.target.value } : null)}
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                            >
                                                <option value="simple">Simple (Fade Up)</option>
                                                <option value="playful">Playful (Scale Up)</option>
                                                <option value="elegant">Elegant (Fade In)</option>
                                                <option value="dynamic">Dynamic (Slide In)</option>
                                                <option value="none">None</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-4">
                                                Brand Colors
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(settings.colors).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                        <span className="text-sm capitalize text-slate-700">{key}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-400 uppercase">{value}</span>
                                                            <input
                                                                type="color"
                                                                value={value}
                                                                onChange={(e) => {
                                                                    const newColors = { ...settings.colors, [key]: e.target.value };
                                                                    setSettings(prev => prev ? { ...prev, colors: newColors } : null);
                                                                }}
                                                                className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200">
                                            <button
                                                onClick={() => saveSettings({ theme: settings.theme, colors: settings.colors })}
                                                disabled={saving}
                                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {saving && <Loader2 className="animate-spin" size={16} />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Billing Settings */}
                            {activeTab === 'billing' && (
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Billing & Payments</h2>
                                    
                                    <div className="space-y-6">
                                        {/* Stripe Connect Status */}
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-slate-900">Stripe Connect</h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {settings.stripe_account_id 
                                                            ? "Your Stripe account is connected. You can accept payments."
                                                            : "Connect your Stripe account to accept payments from customers."
                                                        }
                                                    </p>
                                                </div>
                                                {settings.stripe_account_id ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                                                        <Check size={14} /> Connected
                                                    </span>
                                                ) : (
                                                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm">
                                                        Connect Stripe
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {settings.stripe_account_id && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Stripe Account ID
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-600">
                                                        {settings.stripe_account_id}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(settings.stripe_account_id!)}
                                                        className="p-2 text-slate-400 hover:text-slate-600 transition"
                                                        title="Copy"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
