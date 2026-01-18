"use client";

import { useState } from "react";
import { Loader2, Check, FlaskConical } from "lucide-react";
import { StoreSettings } from "./types";

interface BillingSettingsProps {
    settings: StoreSettings;
    handleConnectStripe: (isTestMode: boolean) => Promise<void>;
    saving: boolean;
}

export function BillingSettings({
    settings,
    handleConnectStripe,
    saving
}: BillingSettingsProps) {
    const [viewMode, setViewMode] = useState<'live' | 'test'>('live');
    const isTestMode = viewMode === 'test';
    
    // Select credentials based on view mode (not global settings)
    const currentAccountId = isTestMode ? settings.stripe_account_id_test : settings.stripe_account_id;
    const currentDetailsSubmitted = isTestMode ? settings.stripe_details_submitted_test : settings.stripe_details_submitted;

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center justify-between">
                Billing & Payments
                
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('live')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            !isTestMode ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        Live Credentials
                    </button>
                    <button
                        onClick={() => setViewMode('test')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                            isTestMode ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <FlaskConical size={14} />
                        Test Credentials
                    </button>
                </div>
            </h2>

            <div className="space-y-6">
                {/* Stripe Connect Status */}
                <div className={`p-4 rounded-lg border ${isTestMode ? "bg-orange-50/50 border-orange-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-900">
                                Stripe Connect {isTestMode ? "(Test)" : "(Live)"}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {currentDetailsSubmitted
                                    ? `Your ${isTestMode ? 'Test' : 'Live'} Stripe account is active and ready.`
                                    : currentAccountId
                                        ? `Your ${isTestMode ? 'Test' : 'Live'} Stripe account is created but setup is incomplete.`
                                        : `Connect your ${isTestMode ? 'Test' : 'Live'} Stripe account to accept payments${isTestMode ? ' on localhost' : ''}.`
                                }
                            </p>
                        </div>
                        {currentDetailsSubmitted ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                                    <Check size={14} /> Active
                                </span>
                                <button
                                    onClick={() => handleConnectStripe(isTestMode)}
                                    disabled={saving}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Manage Account
                                </button>
                            </div>
                        ) : currentAccountId ? (
                            <button
                                onClick={() => handleConnectStripe(isTestMode)}
                                disabled={saving}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium text-sm flex items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={14} />}
                                Continue Setup
                            </button>
                        ) : (
                            <button
                                onClick={() => handleConnectStripe(isTestMode)}
                                disabled={saving}
                                className={`px-4 py-2 text-white rounded-lg transition font-medium text-sm flex items-center gap-2 ${
                                    isTestMode ? "bg-orange-600 hover:bg-orange-700" : "bg-purple-600 hover:bg-purple-700"
                                }`}
                            >
                                {saving && <Loader2 className="animate-spin" size={14} />}
                                Connect {isTestMode ? "Test" : "Live"} Stripe
                            </button>
                        )}
                    </div>
                </div>

                {currentAccountId && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                             {isTestMode ? "Test" : "Live"} Stripe Account ID
                        </label>
                        <code className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono">
                            {currentAccountId}
                        </code>
                    </div>
                )}
                
                <div className="text-sm text-slate-500 pt-4 border-t border-slate-100">
                     <p>
                        <strong>Environment Behavior:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1 ml-1">
                        <li><strong>Live Credentials:</strong> Used when customers checkout on your production domain (e.g. {settings.subdomain}.swatbloc.com).</li>
                        <li><strong>Test Credentials:</strong> Used when checking out from localhost or development environments.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
