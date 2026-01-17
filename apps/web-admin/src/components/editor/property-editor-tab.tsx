"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronLeft, Trash, Plus, Upload, ImageIcon, Undo } from "lucide-react";
import { CounterInput } from "@/components/ui/counter-input";
import { PacketSelector } from "@/components/packet-selector";
import { ProductPicker } from "@/components/product-picker";
import { getAllPacketTypesForBlock, getPacketTypeForBlock } from "@/lib/packet-hydration";

interface PropertyEditorTabProps {
    selectedBlock: any;
    selectedDef: any;
    openSections: Record<string, boolean>;
    setOpenSections: (sections: any) => void;
    updateBlockProps: (id: string, props: any) => void;
    storeId: string;
    collections: any[];
    storeProducts: any[];
    availablePages: any[];
    setIsCreatePageOpen: (open: boolean) => void;
    openMediaManager: (propName: string) => void;
    storeTheme: string;
    setEditingPacketId: (id: string | null) => void;
    refreshPackets: () => void;
}

export function PropertyEditorTab({
    selectedBlock,
    selectedDef,
    openSections,
    setOpenSections,
    updateBlockProps,
    storeId,
    collections,
    storeProducts,
    availablePages,
    setIsCreatePageOpen,
    openMediaManager,
    storeTheme,
    setEditingPacketId,
    refreshPackets
}: PropertyEditorTabProps) {
    if (!selectedBlock || !selectedDef) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-4">
                <Settings size={32} className="mb-3 opacity-20" />
                <p className="text-sm">Select a block on the canvas to edit its properties.</p>
            </div>
        );
    }

    const fieldsBySection: Record<string, any[]> = {};
    selectedDef.fields.forEach((field: any) => {
        const section = field.section || "Other";
        if (!fieldsBySection[section]) fieldsBySection[section] = [];
        fieldsBySection[section].push(field);
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                    {selectedDef.label}
                </span>
            </div>

            {Object.entries(fieldsBySection).map(([sectionName, fields]) => {
                const isOpen = openSections[sectionName] ?? (sectionName === "Content");

                return (
                    <div key={sectionName} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                            onClick={() => setOpenSections((prev: any) => ({ ...prev, [sectionName]: !prev[sectionName] }))}
                            className="w-full bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition"
                        >
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{sectionName}</span>
                            <ChevronLeft size={14} className={`text-slate-400 transform transition-transform duration-200 ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 space-y-4">
                                        {fields.map((field, fieldIndex) => {
                                            // Hide animation style for expandable cards
                                            if (field.name === 'animationStyle' && selectedBlock.props.layout === 'expandable') {
                                                return null;
                                            }

                                            // Show PacketSelector after title/subtitle fields
                                            const showPacketSelector = sectionName === "Content" &&
                                                getAllPacketTypesForBlock(selectedBlock.type).length > 0 &&
                                                (field.name === 'subtitle' || (field.name === 'title' && !fields.some(f => f.name === 'subtitle')));

                                            return (
                                                <div key={field.name}>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                                        {field.name === 'columns' && selectedBlock.props.layout === 'expandable' ? 'Products per row' : field.label}
                                                    </label>

                                                    {field.type === 'collection-select' ? (
                                                        <select
                                                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                            value={selectedBlock.props[field.name] || "all"}
                                                            onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                        >
                                                            <option value="all">All Products</option>
                                                            {collections.map(c => (
                                                                <option key={c.id} value={c.id}>{c.title}</option>
                                                            ))}
                                                        </select>
                                                    ) : field.type === 'product-picker' ? (
                                                        <ProductPicker
                                                            storeId={storeId}
                                                            selectedIds={selectedBlock.props[field.name] || []}
                                                            onChange={(ids) => updateBlockProps(selectedBlock.id, { [field.name]: ids })}
                                                        />
                                                    ) : field.type === 'select' ? (
                                                        <select
                                                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                            value={selectedBlock.props[field.name] || ""}
                                                            onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                        >
                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                            {(field as any).options?.map((opt: any) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.value === 'theme' ? `Theme Default (${storeTheme})` : opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : field.type === 'array' ? (
                                                        <div className="space-y-3">
                                                            {(selectedBlock.props[field.name] || []).map((item: any, index: number) => (
                                                                <div key={index} className="border border-slate-200 rounded p-3 bg-slate-50">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-xs font-bold text-slate-400">Item {index + 1}</span>
                                                                        <button onClick={() => {
                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                            newItems.splice(index, 1);
                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                        }} className="text-red-400 hover:text-red-600"><Trash size={12} /></button>
                                                                    </div>
                                                                    {/* Render sub-fields */}
                                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                    {(field as any).itemSchema?.map((subField: any) => (
                                                                        <div key={subField.name} className="mb-2">
                                                                            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">{subField.label}</label>
                                                                            {subField.type === 'image' ? (
                                                                                <div className="flex gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none"
                                                                                        value={item[subField.name] || ""}
                                                                                        onChange={(e) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            openMediaManager(`${field.name}:${index}:${subField.name}`);
                                                                                        }}
                                                                                        className="bg-slate-100 border border-slate-300 rounded-md px-2 hover:bg-slate-200 text-slate-600"
                                                                                    >
                                                                                        <Upload size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : subField.type === 'product-select' ? (
                                                                                <select
                                                                                    className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none bg-white"
                                                                                    value={item[subField.name] || ""}
                                                                                    onChange={(e) => {
                                                                                        const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                        newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                                        updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                    }}
                                                                                >
                                                                                    <option value="">Select a product...</option>
                                                                                    {storeProducts.map(p => (
                                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                                    ))}
                                                                                </select>
                                                                            ) : (
                                                                                subField.type === 'number' ? (
                                                                                    <CounterInput
                                                                                        value={parseInt(item[subField.name] || "0")}
                                                                                        onChange={(val) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: val };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                        min={(subField as any).min}
                                                                                        className="w-full"
                                                                                    />
                                                                                ) : (
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none focus:border-blue-500"
                                                                                        value={item[subField.name] || ""}
                                                                                        onChange={(e) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                            <button onClick={() => {
                                                                const newItems = [...(selectedBlock.props[field.name] || []), {}];
                                                                updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                            }} className="w-full py-2 text-xs font-medium text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 flex items-center justify-center gap-1">
                                                                <Plus size={12} /> Add Item
                                                            </button>
                                                        </div>
                                                    ) : field.type === 'page-link' ? (
                                                        <div className="flex flex-col gap-2">
                                                            <select
                                                                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                                                value={selectedBlock.props[field.name] || ""}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'CREATE_NEW') {
                                                                        setIsCreatePageOpen(true);
                                                                    } else {
                                                                        updateBlockProps(selectedBlock.id, { [field.name]: e.target.value });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Select a page...</option>
                                                                {availablePages.map((page) => (
                                                                    <option key={page.slug} value={`/${page.slug}`}>
                                                                        {page.name || page.slug} (/{page.slug})
                                                                    </option>
                                                                ))}
                                                                <option value="CREATE_NEW" className="font-bold text-blue-600">+ Create New Page</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                className="w-full border border-slate-300 rounded-md p-2 text-xs text-slate-500 focus:text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                value={selectedBlock.props[field.name] || ""}
                                                                onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                placeholder="Or type custom URL..."
                                                            />
                                                        </div>
                                                    ) : field.type === 'image' ? (
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded-md p-2 text-sm pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                                    value={selectedBlock.props[field.name] || ""}
                                                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                />
                                                                <div className="absolute left-2.5 top-2.5 text-slate-400">
                                                                    <ImageIcon size={14} />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => openMediaManager(field.name)}
                                                                className="bg-slate-100 border border-slate-300 rounded-md px-3 hover:bg-slate-200 text-slate-600 transition"
                                                                title="Select Image"
                                                            >
                                                                <Upload size={16} />
                                                            </button>
                                                        </div>
                                                    ) : field.type === 'number' ? (
                                                        <CounterInput
                                                            value={parseInt(selectedBlock.props[field.name] || "0")}
                                                            onChange={(val) => updateBlockProps(selectedBlock.id, { [field.name]: val })}
                                                            min={(field as any).min}
                                                            className="w-full"
                                                        />
                                                    ) : field.type === 'color' ? (
                                                        <div className="flex gap-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="color"
                                                                    className="h-9 w-9 rounded cursor-pointer border border-slate-300 p-0.5 overflow-hidden"
                                                                    value={selectedBlock.props[field.name] || "#000000"}
                                                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex gap-1">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                                    value={selectedBlock.props[field.name] || ""}
                                                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                    placeholder="Default (Global)"
                                                                />
                                                                {selectedBlock.props[field.name] && (
                                                                    <button
                                                                        onClick={() => updateBlockProps(selectedBlock.id, { [field.name]: undefined })}
                                                                        className="p-2 text-slate-400 hover:text-red-500"
                                                                        title="Reset to Global Default"
                                                                    >
                                                                        <Undo size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                            value={selectedBlock.props[field.name] || ""}
                                                            onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                        />
                                                    )}

                                                    {/* Insert PacketSelector after title/subtitle */}
                                                    {showPacketSelector && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                                                Content Library
                                                            </label>
                                                            <PacketSelector
                                                                storeId={storeId}
                                                                allowedTypes={getAllPacketTypesForBlock(selectedBlock.type)}
                                                                selectedIds={selectedBlock.props.packetIds || []}
                                                                onChange={(ids) => updateBlockProps(selectedBlock.id, { packetIds: ids })}
                                                                onEdit={(packetId) => setEditingPacketId(packetId)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
