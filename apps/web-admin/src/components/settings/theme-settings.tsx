"use client";

import { Loader2 } from "lucide-react";
import { StoreSettings } from "./types";

interface ThemeSettingsProps {
    settings: StoreSettings;
    setSettings: React.Dispatch<React.SetStateAction<StoreSettings | null>>;
    saveSettings: (updates: Partial<StoreSettings>) => Promise<boolean>;
    saving: boolean;
}

export function ThemeSettings({
    settings,
    setSettings,
    saveSettings,
    saving
}: ThemeSettingsProps) {
    return (
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
    );
}
