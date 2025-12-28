"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Plus, X, Sparkles, MessageSquare, HelpCircle, FileText, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContentPacket = {
    id: string;
    type: string;
    name: string;
    data: any;
};

type PacketType = "feature" | "testimonial" | "faq" | "text_block" | "media";

const PACKET_ICONS: Record<PacketType, any> = {
    feature: Sparkles,
    testimonial: MessageSquare,
    faq: HelpCircle,
    text_block: FileText,
    media: Image,
};

interface PacketSelectorProps {
    storeId: string;
    packetType: PacketType;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    maxItems?: number;
    label?: string;
}

export function PacketSelector({
    storeId,
    packetType,
    selectedIds = [],
    onChange,
    maxItems = 10,
    label,
}: PacketSelectorProps) {
    const [packets, setPackets] = useState<ContentPacket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();
    const Icon = PACKET_ICONS[packetType] || Sparkles;

    useEffect(() => {
        fetchPackets();
    }, [storeId, packetType]);

    const fetchPackets = async () => {
        const { data } = await supabase
            .from("content_packets")
            .select("id, type, name, data")
            .eq("store_id", storeId)
            .eq("type", packetType)
            .order("created_at", { ascending: false });

        setPackets(data || []);
        setLoading(false);
    };

    const togglePacket = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else if (selectedIds.length < maxItems) {
            onChange([...selectedIds, id]);
        }
    };

    const removePacket = (id: string) => {
        onChange(selectedIds.filter((i) => i !== id));
    };

    const selectedPackets = packets.filter((p) => selectedIds.includes(p.id));
    const availablePackets = packets.filter((p) => !selectedIds.includes(p.id));

    const getPreviewText = (packet: ContentPacket) => {
        switch (packetType) {
            case "feature":
                return packet.data.title || "Untitled";
            case "testimonial":
                return packet.data.author || "Anonymous";
            case "faq":
                return packet.data.question?.substring(0, 30) + "...";
            case "text_block":
                return packet.data.title || packet.data.body?.substring(0, 30) + "...";
            case "media":
                return packet.data.alt || packet.data.caption || "Media";
            default:
                return packet.name;
        }
    };

    if (loading) {
        return <div className="text-sm text-slate-400">Loading...</div>;
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {label}
                </label>
            )}

            {/* Selected Items */}
            <div className="space-y-1">
                {selectedPackets.map((packet) => (
                    <div
                        key={packet.id}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                    >
                        <div className="flex items-center gap-2">
                            <Icon size={14} className="text-blue-500" />
                            <span className="text-sm text-slate-700">{getPreviewText(packet)}</span>
                        </div>
                        <button
                            onClick={() => removePacket(packet.id)}
                            className="text-slate-400 hover:text-red-500 transition"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            {packets.length > 0 ? (
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                        <Plus size={14} />
                        Add {packetType.replace("_", " ")}
                    </button>

                    <AnimatePresence>
                        {isOpen && availablePackets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                            >
                                {availablePackets.map((packet) => (
                                    <button
                                        key={packet.id}
                                        onClick={() => {
                                            togglePacket(packet.id);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition text-left"
                                    >
                                        <Icon size={14} className="text-slate-400" />
                                        <span className="text-sm text-slate-700">{getPreviewText(packet)}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <a
                    href={`/store/${storeId}/content`}
                    target="_blank"
                    className="block text-center text-xs text-blue-600 hover:underline"
                >
                    Create {packetType.replace("_", " ")}s in Content Library →
                </a>
            )}
        </div>
    );
}
