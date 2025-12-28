"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, X, Plus, Image as ImageIcon, Minus } from "lucide-react";
import { MediaManager } from "./media-manager";

interface PacketEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    packetId: string | null;
    packetType: string;
    storeId: string;
    onSave: (newPacketId?: string) => void;
    maxColumns?: number;
}

const DEFAULT_DATA: Record<string, any> = {
    feature: { icon: "Star", title: "", description: "", image: "", colSpan: 1 },
    testimonial: { quote: "", author: "", role: "", image: "", colSpan: 1 },
    faq: { question: "", answer: "", image: "", colSpan: 1 },
    text_block: { title: "", content: "", image: "", colSpan: 1 },
    media: { url: "", alt: "", caption: "", colSpan: 1 },
};

const PACKET_LABELS: Record<string, string> = {
    feature: "Feature",
    testimonial: "Testimonial",
    faq: "FAQ",
    text_block: "Text Block",
    media: "Media",
};

// Reusable Image Picker component
function ImagePicker({
    value,
    onChange,
    label = "Background Image"
}: {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}) {
    const [isMediaOpen, setIsMediaOpen] = useState(false);

    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>

            {value ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img
                        src={value}
                        alt="Selected"
                        className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsMediaOpen(true)}
                            className="px-3 py-1.5 bg-white text-slate-700 rounded text-xs font-medium"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-4 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition"
                >
                    <ImageIcon size={16} />
                    Choose Image
                </button>
            )}

            <MediaManager
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={(url) => {
                    onChange(url);
                    setIsMediaOpen(false);
                }}
            />
        </div>
    );
}

// Reusable ColSpan Picker with +/- buttons
function ColSpanPicker({
    value,
    onChange,
    min = 1,
    max = 4
}: {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Column Span</label>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    <Minus size={16} />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-xl font-bold text-slate-700">{value}</span>
                    <span className="text-xs text-slate-400 ml-1">/ {max}</span>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    <Plus size={16} />
                </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">Items per row in grid</p>
        </div>
    );
}

export function PacketEditorDialog({ isOpen, onClose, packetId, packetType, storeId, onSave, maxColumns = 4 }: PacketEditorDialogProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [data, setData] = useState<Record<string, any>>({});

    const isCreateMode = !packetId;
    const label = PACKET_LABELS[packetType] || packetType;

    useEffect(() => {
        if (isOpen && packetId) {
            loadPacket();
        } else if (isOpen && !packetId) {
            setName(`New ${label}`);
            setData(DEFAULT_DATA[packetType] || {});
        } else {
            setName("");
            setData({});
        }
    }, [isOpen, packetId, packetType]);

    const loadPacket = async () => {
        if (!packetId) return;
        setLoading(true);
        try {
            const { data: packet, error } = await supabase
                .from("content_packets")
                .select("*")
                .eq("id", packetId)
                .single();

            if (packet) {
                setName(packet.name);
                setData(packet.data || {});
            }
        } catch (e) {
            console.error("Error loading packet", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isCreateMode) {
                const { data: newPacket, error } = await supabase
                    .from("content_packets")
                    .insert({
                        store_id: storeId,
                        type: packetType,
                        name,
                        data
                    })
                    .select()
                    .single();

                if (!error && newPacket) {
                    onSave(newPacket.id);
                    onClose();
                }
            } else {
                const { error } = await supabase
                    .from("content_packets")
                    .update({
                        name,
                        data,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", packetId);

                if (!error) {
                    onSave();
                    onClose();
                }
            }
        } catch (e) {
            console.error("Error saving packet", e);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const renderFields = () => {
        switch (packetType) {
            case 'feature':
                return (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.title || ""}
                                onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                            <textarea
                                className="w-full border border-slate-300 rounded-md p-2 text-sm h-24"
                                value={data.description || ""}
                                onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Icon (Lucide Name)</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.icon || ""}
                                onChange={e => setData(prev => ({ ...prev, icon: e.target.value }))}
                                placeholder="e.g. Star, Zap, Shield"
                            />
                        </div>
                        <ImagePicker
                            value={data.image || ""}
                            onChange={(url) => setData(prev => ({ ...prev, image: url }))}
                            label="Background Image"
                        />
                        <ColSpanPicker
                            value={data.colSpan || 1}
                            onChange={(val) => setData(prev => ({ ...prev, colSpan: val }))}
                            max={maxColumns}
                        />
                    </>
                );
            case 'testimonial':
                return (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Review Quote</label>
                            <textarea
                                className="w-full border border-slate-300 rounded-md p-2 text-sm h-24"
                                value={data.quote || ""}
                                onChange={e => setData(prev => ({ ...prev, quote: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Author Name</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.author || ""}
                                onChange={e => setData(prev => ({ ...prev, author: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Role / Title</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.role || ""}
                                onChange={e => setData(prev => ({ ...prev, role: e.target.value }))}
                            />
                        </div>
                        <ImagePicker
                            value={data.image || ""}
                            onChange={(url) => setData(prev => ({ ...prev, image: url }))}
                            label="Avatar / Photo"
                        />
                        <ColSpanPicker
                            value={data.colSpan || 1}
                            onChange={(val) => setData(prev => ({ ...prev, colSpan: val }))}
                            max={maxColumns}
                        />
                    </>
                );
            case 'faq':
                return (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Question</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.question || ""}
                                onChange={e => setData(prev => ({ ...prev, question: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Answer</label>
                            <textarea
                                className="w-full border border-slate-300 rounded-md p-2 text-sm h-32"
                                value={data.answer || ""}
                                onChange={e => setData(prev => ({ ...prev, answer: e.target.value }))}
                            />
                        </div>
                        <ColSpanPicker
                            value={data.colSpan || 1}
                            onChange={(val) => setData(prev => ({ ...prev, colSpan: val }))}
                            max={maxColumns}
                        />
                    </>
                );
            case 'text_block':
                return (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Heading</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.title || ""}
                                onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Content/Body</label>
                            <textarea
                                className="w-full border border-slate-300 rounded-md p-2 text-sm h-48 font-mono"
                                value={data.content || ""}
                                onChange={e => setData(prev => ({ ...prev, content: e.target.value }))}
                            />
                        </div>
                        <ImagePicker
                            value={data.image || ""}
                            onChange={(url) => setData(prev => ({ ...prev, image: url }))}
                            label="Image"
                        />
                        <ColSpanPicker
                            value={data.colSpan || 1}
                            onChange={(val) => setData(prev => ({ ...prev, colSpan: val }))}
                            max={maxColumns}
                        />
                    </>
                );
            case 'media':
                return (
                    <>
                        <ImagePicker
                            value={data.url || ""}
                            onChange={(url) => setData(prev => ({ ...prev, url: url }))}
                            label="Media File"
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Alt Text</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.alt || ""}
                                onChange={e => setData(prev => ({ ...prev, alt: e.target.value }))}
                                placeholder="Describe the image for accessibility"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Caption</label>
                            <input
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={data.caption || ""}
                                onChange={e => setData(prev => ({ ...prev, caption: e.target.value }))}
                            />
                        </div>
                        <ColSpanPicker
                            value={data.colSpan || 1}
                            onChange={(val) => setData(prev => ({ ...prev, colSpan: val }))}
                            max={maxColumns}
                        />
                    </>
                );
            default:
                return (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded text-sm">
                        Generic editor for {packetType} is not fully implemented.
                        <pre className="mt-2 text-xs">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">
                        {isCreateMode ? `New ${label}` : `Edit ${label}`}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Name (Internal)</label>
                                <input
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Hero Feature, FAQ #1"
                                />
                            </div>

                            <hr className="border-slate-100" />

                            {renderFields()}
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || saving || !name.trim()}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {isCreateMode ? (
                            <>
                                <Plus size={14} />
                                Create
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
