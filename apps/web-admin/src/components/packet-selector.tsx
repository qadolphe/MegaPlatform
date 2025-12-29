"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Sparkles, MessageSquare, HelpCircle, FileText, Image, ArrowUp, ArrowDown } from "lucide-react";
import { ContentPickerDialog } from "./content-picker-dialog";

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
    packetType?: PacketType; // Optional - if not provided, shows all types
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    onEdit?: (packetId: string) => void;
    maxItems?: number;
    label?: string;
}

export function PacketSelector({
    storeId,
    packetType,
    selectedIds = [],
    onChange,
    onEdit,
    maxItems = 20,
    label,
}: PacketSelectorProps) {
    const [packets, setPackets] = useState<ContentPacket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchPackets();
    }, [storeId]);

    const fetchPackets = async () => {
        let query = supabase
            .from("content_packets")
            .select("id, type, name, data")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        const { data } = await query;
        setPackets(data || []);
        setLoading(false);
    };

    const removePacket = (id: string) => {
        onChange(selectedIds.filter((i) => i !== id));
    };

    const selectedPackets = packets
        .filter((p) => selectedIds.includes(p.id))
        .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id));

    const getPreviewText = (packet: ContentPacket) => {
        const data = packet.data;
        switch (packet.type) {
            case "feature":
                return data.title || packet.name;
            case "testimonial":
                return data.author || packet.name;
            case "faq":
                return data.question?.substring(0, 30) + "..." || packet.name;
            case "text_block":
                return data.title || packet.name;
            case "media":
                return data.alt || data.caption || packet.name;
            default:
                return packet.name;
        }
    };

    const handlePickerChange = (ids: string[]) => {
        onChange(ids);
        fetchPackets(); // Refresh to get any newly created packets
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

            {selectedPackets.length > 0 && (
                <div className="space-y-1">
                    {selectedPackets.map((packet, index) => {
                        const Icon = PACKET_ICONS[packet.type as PacketType] || Sparkles;
                        return (
                            <div
                                key={packet.id}
                                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition group"
                                onClick={() => onEdit?.(packet.id)}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Icon size={14} className="text-slate-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 truncate">{getPreviewText(packet)}</span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {packet.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newIds = [...selectedIds];
                                            if (index > 0) {
                                                [newIds[index], newIds[index - 1]] = [newIds[index - 1], newIds[index]];
                                                onChange(newIds);
                                            }
                                        }}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                                        title="Move Up"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newIds = [...selectedIds];
                                            if (index < selectedIds.length - 1) {
                                                [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
                                                onChange(newIds);
                                            }
                                        }}
                                        disabled={index === selectedIds.length - 1}
                                        className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                                        title="Move Down"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                    <div className="w-px h-3 bg-slate-300 mx-1"></div>
                                    {onEdit && (
                                        <span className="text-[10px] text-slate-400 mr-1 hover:text-slate-600">edit</span>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removePacket(packet.id); }}
                                        className="text-slate-400 hover:text-red-500 transition"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Button */}
            <button
                onClick={() => setIsPickerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition"
            >
                <Plus size={14} />
                Add Content
            </button>

            {/* Content Picker Dialog */}
            <ContentPickerDialog
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                storeId={storeId}
                selectedIds={selectedIds}
                onChange={handlePickerChange}
                allowedTypes={packetType ? [packetType] : undefined}
            />
        </div>
    );
}


