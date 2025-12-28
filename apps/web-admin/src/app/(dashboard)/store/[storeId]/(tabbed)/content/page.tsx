"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, MessageSquare, HelpCircle, FileText, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContentPacket = {
    id: string;
    type: string;
    name: string;
    data: any;
    created_at: string;
};

type PacketType = "feature" | "testimonial" | "faq" | "text_block";

const PACKET_TYPES: { key: PacketType; label: string; icon: any; description: string }[] = [
    { key: "feature", label: "Features", icon: Sparkles, description: "Benefit cards with icons" },
    { key: "testimonial", label: "Testimonials", icon: MessageSquare, description: "Customer quotes" },
    { key: "faq", label: "FAQs", icon: HelpCircle, description: "Questions & answers" },
    { key: "text_block", label: "Text Blocks", icon: FileText, description: "Reusable copy" },
];

const DEFAULT_DATA: Record<PacketType, any> = {
    feature: { icon: "Star", title: "", description: "" },
    testimonial: { quote: "", author: "", role: "", avatar_url: "" },
    faq: { question: "", answer: "" },
    text_block: { title: "", body: "" },
};

export default function ContentManagerPage() {
    const params = useParams();
    const storeId = params.storeId as string;
    const [packets, setPackets] = useState<ContentPacket[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<PacketType>("feature");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newData, setNewData] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchPackets();
    }, [storeId]);

    const fetchPackets = async () => {
        const { data, error } = await supabase
            .from("content_packets")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (!error && data) setPackets(data);
        setLoading(false);
    };

    const filteredPackets = packets.filter((p) => p.type === activeType);

    const handleCreate = async () => {
        if (!newName.trim()) return;

        const { error } = await supabase.from("content_packets").insert({
            store_id: storeId,
            type: activeType,
            name: newName,
            data: newData || DEFAULT_DATA[activeType],
        });

        if (!error) {
            fetchPackets();
            setIsCreating(false);
            setNewName("");
            setNewData(null);
        }
    };

    const handleUpdate = async (id: string) => {
        const packet = packets.find((p) => p.id === id);
        if (!packet) return;

        const { error } = await supabase
            .from("content_packets")
            .update({ data: editData, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (!error) {
            fetchPackets();
            setEditingId(null);
            setEditData(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this content?")) return;

        const { error } = await supabase.from("content_packets").delete().eq("id", id);
        if (!error) fetchPackets();
    };

    const startEditing = (packet: ContentPacket) => {
        setEditingId(packet.id);
        setEditData({ ...packet.data });
    };

    const renderDataEditor = (data: any, setData: (d: any) => void, type: PacketType) => {
        switch (type) {
            case "feature":
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Icon (e.g., Star, Shield, Zap)"
                            value={data.icon || ""}
                            onChange={(e) => setData({ ...data, icon: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={data.title || ""}
                            onChange={(e) => setData({ ...data, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <textarea
                            placeholder="Description"
                            value={data.description || ""}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20"
                        />
                    </div>
                );
            case "testimonial":
                return (
                    <div className="space-y-3">
                        <textarea
                            placeholder="Quote"
                            value={data.quote || ""}
                            onChange={(e) => setData({ ...data, quote: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Author name"
                                value={data.author || ""}
                                onChange={(e) => setData({ ...data, author: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Role / Title"
                                value={data.role || ""}
                                onChange={(e) => setData({ ...data, role: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                );
            case "faq":
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Question"
                            value={data.question || ""}
                            onChange={(e) => setData({ ...data, question: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <textarea
                            placeholder="Answer"
                            value={data.answer || ""}
                            onChange={(e) => setData({ ...data, answer: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24"
                        />
                    </div>
                );
            case "text_block":
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={data.title || ""}
                            onChange={(e) => setData({ ...data, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <textarea
                            placeholder="Body text"
                            value={data.body || ""}
                            onChange={(e) => setData({ ...data, body: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-32"
                        />
                    </div>
                );
        }
    };

    const renderPreview = (packet: ContentPacket) => {
        switch (packet.type) {
            case "feature":
                return (
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{packet.data.title || "Untitled"}</p>
                            <p className="text-sm text-slate-500 line-clamp-2">{packet.data.description}</p>
                        </div>
                    </div>
                );
            case "testimonial":
                return (
                    <div>
                        <p className="text-slate-700 italic line-clamp-2">"{packet.data.quote}"</p>
                        <p className="text-sm text-slate-500 mt-1">— {packet.data.author || "Anonymous"}</p>
                    </div>
                );
            case "faq":
                return (
                    <div>
                        <p className="font-medium text-slate-900">{packet.data.question || "Untitled"}</p>
                        <p className="text-sm text-slate-500 line-clamp-2">{packet.data.answer}</p>
                    </div>
                );
            case "text_block":
                return (
                    <div>
                        {packet.data.title && <p className="font-medium text-slate-900">{packet.data.title}</p>}
                        <p className="text-sm text-slate-500 line-clamp-3">{packet.data.body}</p>
                    </div>
                );
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Content Library</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Create reusable content for your page builder
                </p>
            </div>

            {/* Type Tabs */}
            <div className="flex gap-2 mb-6">
                {PACKET_TYPES.map((type) => (
                    <button
                        key={type.key}
                        onClick={() => setActiveType(type.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeType === type.key
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <type.icon size={16} />
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Create Button */}
                <motion.button
                    onClick={() => {
                        setIsCreating(true);
                        setNewData(DEFAULT_DATA[activeType]);
                    }}
                    className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition text-slate-500 hover:text-blue-600"
                >
                    <Plus size={24} />
                    <span className="text-sm font-medium">Add {PACKET_TYPES.find((t) => t.key === activeType)?.label.slice(0, -1)}</span>
                </motion.button>

                {/* Existing Packets */}
                <AnimatePresence mode="popLayout">
                    {filteredPackets.map((packet) => (
                        <motion.div
                            key={packet.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                        >
                            {editingId === packet.id ? (
                                <div className="space-y-4">
                                    {renderDataEditor(editData, setEditData, activeType)}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(packet.id)}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Save size={14} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                            {packet.name}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => startEditing(packet)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(packet.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {renderPreview(packet)}
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsCreating(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    New {PACKET_TYPES.find((t) => t.key === activeType)?.label.slice(0, -1)}
                                </h2>
                                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Name (for your reference)"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    autoFocus
                                />
                                {renderDataEditor(newData, setNewData, activeType)}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim()}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
