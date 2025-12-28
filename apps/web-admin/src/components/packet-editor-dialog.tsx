"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, X } from "lucide-react";

interface PacketEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    packetId: string | null;
    packetType: string;
    storeId: string;
    onSave: () => void;
}

export function PacketEditorDialog({ isOpen, onClose, packetId, packetType, storeId, onSave }: PacketEditorDialogProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [data, setData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isOpen && packetId) {
            loadPacket();
        } else {
            // Reset if opening for create (not supported yet here, only edit)
            setName("");
            setData({});
        }
    }, [isOpen, packetId]);

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
        if (!packetId) return;
        setSaving(true);
        try {
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
        } catch (e) {
            console.error("Error saving packet", e);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Define fields based on packet type
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
                    <h3 className="font-bold text-slate-700">Edit {packetType}</h3>
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
                                <label className="text-xs font-semibold text-slate-500 uppercase">Packet Name (Internal)</label>
                                <input
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm bg-slate-50"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
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
                        disabled={loading || saving}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
