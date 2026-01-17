"use client";

import { Loader2, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { StoreSettings } from "./types";

interface DomainSettingsProps {
    settings: StoreSettings;
    customDomain: string;
    setCustomDomain: (domain: string) => void;
    domainStatus: 'idle' | 'checking' | 'verified' | 'pending' | 'error';
    handleDomainSave: () => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emailDomains: any[];
    newEmailDomain: string;
    setNewEmailDomain: (domain: string) => void;
    handleAddEmailDomain: () => Promise<void>;
    addingEmailDomain: boolean;
    copyToClipboard: (text: string) => void;
    saving: boolean;
}

export function DomainSettings({
    settings,
    customDomain,
    setCustomDomain,
    domainStatus,
    handleDomainSave,
    emailDomains,
    newEmailDomain,
    setNewEmailDomain,
    handleAddEmailDomain,
    addingEmailDomain,
    copyToClipboard,
    saving
}: DomainSettingsProps) {
    return (
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
                            {settings.subdomain}.swatbloc.com
                        </code>
                        <button
                            onClick={() => copyToClipboard(`${settings.subdomain}.swatbloc.com`)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition"
                            title="Copy"
                        >
                            <Copy size={16} />
                        </button>
                        <a
                            href={`https://${settings.subdomain}.swatbloc.com`}
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
                {(customDomain || settings.custom_domain) && (domainStatus === 'pending' || settings.custom_domain) && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1">
                                <h4 className="font-medium text-amber-800 mb-2">DNS Configuration Required</h4>
                                <p className="text-sm text-amber-700 mb-3">
                                    Add the following DNS records with your domain registrar:
                                </p>
                                <div className="space-y-3">
                                    <div className="bg-white rounded border border-amber-200 p-3">
                                        <p className="text-xs text-amber-700 mb-2 font-medium">For root domain ({customDomain || settings.custom_domain}):</p>
                                        <div className="grid grid-cols-3 gap-4 text-sm font-mono">
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
                                                <span className="ml-2 text-slate-900">{settings.subdomain}.swatbloc.com</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded border border-amber-200 p-3">
                                        <p className="text-xs text-amber-700 mb-2 font-medium">For www.{customDomain || settings.custom_domain}:</p>
                                        <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                                            <div>
                                                <span className="text-slate-500">Type:</span>
                                                <span className="ml-2 text-slate-900">CNAME</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Name:</span>
                                                <span className="ml-2 text-slate-900">www</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Value:</span>
                                                <span className="ml-2 text-slate-900">{settings.subdomain}.swatbloc.com</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-amber-600 mt-3">
                                    <strong>Note:</strong> Some registrars don't support CNAME on root (@). In that case, use only the www record and enable forwarding from @ to www.
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

                    <div className="space-y-4 mb-6">
                        {emailDomains.map((domain) => (
                            <div key={domain.id} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-slate-900">{domain.domain}</div>
                                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${domain.status === 'verified' ? 'bg-green-100 text-green-700' :
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

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newEmailDomain}
                            onChange={(e) => setNewEmailDomain(e.target.value)}
                            placeholder="mail.yourdomain.com"
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        <button
                            onClick={handleAddEmailDomain}
                            disabled={addingEmailDomain || !newEmailDomain}
                            className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            {addingEmailDomain && <Loader2 className="animate-spin" size={16} />}
                            Add Domain
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
