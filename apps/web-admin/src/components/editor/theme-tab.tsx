"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface ThemeTabProps {
    storeTheme: string;
    setStoreTheme: (theme: string) => void;
    storeColors: any;
    setStoreColors: (colors: any, save: boolean) => void;
    colorsExpanded: boolean;
    setColorsExpanded: (expanded: boolean) => void;
    storeId: string;
    supabase: any;
}

export function ThemeTab({
    storeTheme,
    setStoreTheme,
    storeColors,
    setStoreColors,
    colorsExpanded,
    setColorsExpanded,
    storeId,
    supabase
}: ThemeTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
        >
            <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                    Global Theme
                </span>
                <p className="text-xs text-slate-500 mt-2">
                    This theme controls the default animation style for all components set to "Theme Default".
                </p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Animation Style
                </label>
                <select
                    className="w-full border border-slate-300 rounded-md p-2 text-sm"
                    value={storeTheme}
                    onChange={async (e) => {
                        const newTheme = e.target.value;
                        setStoreTheme(newTheme);
                        await supabase
                            .from("stores")
                            .update({ theme: newTheme })
                            .eq("id", storeId);
                    }}
                >
                    <option value="simple">Simple (Fade Up)</option>
                    <option value="playful">Playful (Scale Up)</option>
                    <option value="elegant">Elegant (Fade In)</option>
                    <option value="dynamic">Dynamic (Slide In)</option>
                    <option value="none">None</option>
                </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={() => setColorsExpanded(!colorsExpanded)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide hover:text-slate-700"
                >
                    Global Colors
                    <ChevronLeft size={14} className={`transform transition ${colorsExpanded ? '-rotate-90' : 'rotate-0'}`} />
                </button>
                <AnimatePresence>
                    {colorsExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 mt-3">
                                {Object.entries(storeColors).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm capitalize text-slate-700">{key}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 uppercase">{value}</span>
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => {
                                                    const newColors = { ...storeColors, [key]: e.target.value };
                                                    setStoreColors(newColors, false);
                                                }}
                                                onBlur={async () => {
                                                    setStoreColors(storeColors, true);
                                                    await supabase
                                                        .from("stores")
                                                        .update({ colors: storeColors })
                                                        .eq("id", storeId);
                                                }}
                                                className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
