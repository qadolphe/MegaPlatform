"use client";

import { Loader2, Image as ImageIcon, Globe } from "lucide-react";
import { StoreSettings } from "./types";

interface GeneralSettingsProps {
    settings: StoreSettings;
    setSettings: React.Dispatch<React.SetStateAction<StoreSettings | null>>;
    saveSettings: (updates: Partial<StoreSettings>) => Promise<boolean>;
    saving: boolean;
    setMediaTarget: (target: 'logo' | 'favicon' | null) => void;
    setIsMediaOpen: (open: boolean) => void;
}

export function GeneralSettings({
    settings,
    setSettings,
    saveSettings,
    saving,
    setMediaTarget,
    setIsMediaOpen
}: GeneralSettingsProps) {
    return (
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
                    <p className="text-xs text-slate-500 mt-1">This will be used as the browser title.</p>
                </div>

                {/* Logo & Favicon */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Store Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                                {settings.logo_url ? (
                                    <img src={settings.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="text-slate-300" size={24} />
                                )}
                                <button
                                    onClick={() => { setMediaTarget('logo'); setIsMediaOpen(true); }}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="text-white text-xs font-medium">Change</span>
                                </button>
                            </div>
                            {settings.logo_url && (
                                <button
                                    onClick={() => setSettings(prev => prev ? { ...prev, logo_url: null } : null)}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Favicon
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                                {settings.favicon_url ? (
                                    <img src={settings.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" />
                                ) : (
                                    <Globe className="text-slate-300" size={24} />
                                )}
                                <button
                                    onClick={() => { setMediaTarget('favicon'); setIsMediaOpen(true); }}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="text-white text-xs font-medium">Change</span>
                                </button>
                            </div>
                            {settings.favicon_url && (
                                <button
                                    onClick={() => setSettings(prev => prev ? { ...prev, favicon_url: null } : null)}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
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
                        onClick={() => saveSettings({
                            name: settings.name,
                            currency: settings.currency,
                            logo_url: settings.logo_url,
                            favicon_url: settings.favicon_url
                        })}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="animate-spin" size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
