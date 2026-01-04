"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Plus, Sparkles, MessageSquare, HelpCircle, FileText, Image, Check, Loader2, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContentPacket = {
    id: string;
    type: string;
    name: string;
    data: any;
};

type PacketType = "feature" | "testimonial" | "faq" | "text_block" | "media" | "stat";

const CATEGORIES: { key: PacketType; label: string; icon: any }[] = [
    { key: "feature", label: "Features", icon: Sparkles },
    { key: "testimonial", label: "Testimonials", icon: MessageSquare },
    { key: "faq", label: "FAQs", icon: HelpCircle },
    { key: "text_block", label: "Text", icon: FileText },
    { key: "media", label: "Media", icon: Image },
    { key: "stat", label: "Webstore Stats", icon: BarChart3 },
];

interface ContentPickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    allowedTypes?: PacketType[];
}

export function ContentPickerDialog({
    isOpen,
    onClose,
    storeId,
    selectedIds,
    onChange,
    allowedTypes,
}: ContentPickerDialogProps) {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<PacketType>("feature");
    const [packets, setPackets] = useState<ContentPacket[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");

    const availableCategories = allowedTypes
        ? CATEGORIES.filter(c => allowedTypes.includes(c.key))
        : CATEGORIES;

    useEffect(() => {
        if (isOpen) {
            fetchAllPackets();
            // Set first available tab
            if (allowedTypes && allowedTypes.length > 0) {
                setActiveTab(allowedTypes[0]);
            }
        }
    }, [isOpen, storeId]);

    const fetchAllPackets = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("content_packets")
            .select("id, type, name, data")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        setPackets(data || []);
        setLoading(false);
    };

    const togglePacket = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const createNewPacket = async () => {
        if (!newName.trim()) return;
        setCreating(true);

        const defaultData: Record<PacketType, any> = {
            feature: { title: newName, description: "", icon: "Star", image: "", colSpan: 1 },
            testimonial: { quote: "", author: newName, role: "", image: "", colSpan: 1 },
            faq: { question: newName, answer: "", colSpan: 1 },
            text_block: { title: newName, content: "", colSpan: 1 },
            media: { url: "", alt: newName, caption: "", colSpan: 1 },
            stat: { value: "", label: newName, prefix: "", suffix: "" },
        };

        const { data: newPacket, error } = await supabase
            .from("content_packets")
            .insert({
                store_id: storeId,
                type: activeTab,
                name: newName,
                data: defaultData[activeTab]
            })
            .select()
            .single();

        if (!error && newPacket) {
            setPackets(prev => [newPacket, ...prev]);
            onChange([...selectedIds, newPacket.id]);
            setNewName("");
        }
        setCreating(false);
    };

    const getPreviewText = (packet: ContentPacket) => {
        const data = packet.data;
        switch (packet.type) {
            case "feature":
                return data.title || packet.name;
            case "testimonial":
                return data.author || packet.name;
            case "faq":
                return data.question?.substring(0, 40) || packet.name;
            case "text_block":
                return data.title || packet.name;
            case "media":
                return data.alt || data.caption || packet.name;
            case "stat":
                return `${data.prefix || ""}${data.value || ""}${data.suffix || ""} ${data.label || packet.name}`.trim();
            default:
                return packet.name;
        }
    };

    const filteredPackets = packets.filter(p => p.type === activeTab);
    const ActiveIcon = CATEGORIES.find(c => c.key === activeTab)?.icon || Sparkles;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Add Content</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {availableCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.key;
                        const count = packets.filter(p => p.type === cat.key).length;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setActiveTab(cat.key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${isActive
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Icon size={16} />
                                {cat.label}
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="p-4 max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Create New */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`New ${CATEGORIES.find(c => c.key === activeTab)?.label.slice(0, -1) || "item"} name...`}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && createNewPacket()}
                                />
                                <button
                                    onClick={createNewPacket}
                                    disabled={!newName.trim() || creating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                    Create
                                </button>
                            </div>

                            {/* Existing Packets */}
                            {filteredPackets.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredPackets.map((packet) => {
                                        const isSelected = selectedIds.includes(packet.id);
                                        return (
                                            <button
                                                key={packet.id}
                                                onClick={() => togglePacket(packet.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${isSelected
                                                        ? "bg-blue-50 border border-blue-200"
                                                        : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ActiveIcon size={14} className={isSelected ? "text-blue-500" : "text-slate-400"} />
                                                    <span className="text-sm text-slate-700">{getPreviewText(packet)}</span>
                                                </div>
                                                {isSelected && (
                                                    <Check size={16} className="text-blue-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No {CATEGORIES.find(c => c.key === activeTab)?.label.toLowerCase()} yet. Create one above!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                        {selectedIds.length} selected
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
