"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { COMPONENT_DEFINITIONS, COMPONENT_CATEGORIES } from "@/config/component-registry";

interface ComponentListTabProps {
    insertIndex: number | null;
    setInsertIndex: (index: number | null) => void;
    insertBlock: (index: number, type: string, props: any) => void;
    addBlock: (type: string, props: any) => void;
    blocks: any[];
}

export function ComponentListTab({
    insertIndex,
    setInsertIndex,
    insertBlock,
    addBlock,
    blocks
}: ComponentListTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            {Object.entries(COMPONENT_CATEGORIES)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([categoryKey, categoryInfo]) => {
                    const componentsInCategory = Object.entries(COMPONENT_DEFINITIONS)
                        .filter(([key, def]) => key !== 'Header' && key !== 'Footer' && def.category === categoryKey)
                        .sort((a, b) => a[1].label.localeCompare(b[1].label));

                    if (componentsInCategory.length === 0) return null;

                    return (
                        <div key={categoryKey}>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{categoryInfo.label}</p>
                            <div className="grid gap-2">
                                {componentsInCategory.map(([key, def]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            if (insertIndex !== null) {
                                                insertBlock(insertIndex, key, def.defaultProps);
                                                setInsertIndex(null);
                                            } else {
                                                const footerIndex = blocks.findIndex(b => b.type === 'Footer');
                                                if (footerIndex !== -1) {
                                                    insertBlock(footerIndex, key, def.defaultProps);
                                                } else {
                                                    addBlock(key, def.defaultProps);
                                                }
                                            }
                                        }}
                                        className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm hover:bg-blue-50/30 transition text-left group bg-white"
                                    >
                                        <div className="h-7 w-7 bg-slate-100 rounded flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <Plus size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{def.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
        </motion.div>
    );
}
