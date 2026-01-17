"use client";

import { Loader2, Check } from "lucide-react";
import { StoreSettings } from "./types";

interface BillingSettingsProps {
    settings: StoreSettings;
    handleConnectStripe: () => Promise<void>;
    saving: boolean;
}

export function BillingSettings({
    settings,
    handleConnectStripe,
    saving
}: BillingSettingsProps) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Billing & Payments</h2>

            <div className="space-y-6">
                {/* Stripe Connect Status */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-900">Stripe Connect</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {settings.stripe_details_submitted
                                    ? "Your Stripe account is active and ready to accept payments."
                                    : settings.stripe_account_id
                                        ? "Your Stripe account is created but setup is incomplete."
                                        : "Connect your Stripe account to accept payments from customers."
                                }
                            </p>
                        </div>
                        {settings.stripe_details_submitted ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                                    <Check size={14} /> Active
                                </span>
                                <button
                                    onClick={handleConnectStripe}
                                    disabled={saving}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Manage Account
                                </button>
                            </div>
                        ) : settings.stripe_account_id ? (
                            <button
                                onClick={handleConnectStripe}
                                disabled={saving}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium text-sm flex items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={14} />}
                                Continue Setup
                            </button>
                        ) : (
                            <button
                                onClick={handleConnectStripe}
                                disabled={saving}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm flex items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={14} />}
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
                        <code className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-mono">
                            {settings.stripe_account_id}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}
