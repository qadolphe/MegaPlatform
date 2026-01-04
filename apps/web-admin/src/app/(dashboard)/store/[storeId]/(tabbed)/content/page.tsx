"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, MessageSquare, HelpCircle, FileText, Plus, Trash2, Edit2, Save, X, Image, Video, Upload, Wand2, Loader2, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ContentPacket = {
    id: string;
    type: string;
    name: string;
    data: any;
    created_at: string;
};

type PacketType = "feature" | "testimonial" | "faq" | "text_block" | "media" | "stat";

const PACKET_TYPES: { key: PacketType; label: string; singular: string; icon: any; description: string }[] = [
    { key: "feature", label: "Features", singular: "Feature", icon: Sparkles, description: "Benefit cards with icons" },
    { key: "testimonial", label: "Testimonials", singular: "Testimonial", icon: MessageSquare, description: "Customer quotes" },
    { key: "faq", label: "FAQs", singular: "FAQ", icon: HelpCircle, description: "Questions & answers" },
    { key: "text_block", label: "Text Blocks", singular: "Text Block", icon: FileText, description: "Reusable copy" },
    { key: "media", label: "Media", singular: "Media", icon: Image, description: "Images & videos" },
    { key: "stat", label: "Webstore Stats", singular: "Stat", icon: BarChart3, description: "Store metrics used in Stats sections" },
];

const DEFAULT_DATA: Record<PacketType, any> = {
    feature: { icon: "Star", title: "", description: "" },
    testimonial: { quote: "", author: "", role: "", avatar_url: "" },
    faq: { question: "", answer: "" },
    text_block: { title: "", body: "" },
    media: { url: "", alt: "", caption: "", mediaType: "image" },
    stat: { label: "", value: "", prefix: "", suffix: "" },
};

const AI_MEDIA_MODELS = [
    { id: 'gemini-2.5-flash-image', name: '🖼️ Gemini 2.5 Flash (Fast)', type: 'image' },
    { id: 'gemini-3-pro-image-preview', name: '🖼️ Gemini 3 Pro (Quality)', type: 'image' },
    { id: 'veo-3.1-generate-preview', name: '🎬 Veo 3.1 (Video)', type: 'video' },
];

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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // AI Media Generation State
    const [aiGenPrompt, setAiGenPrompt] = useState("");
    const [aiGenModel, setAiGenModel] = useState("gemini-2.5-flash-image");
    const [aiGenLoading, setAiGenLoading] = useState(false);
    const [aiGenResult, setAiGenResult] = useState<{ url: string; type: string } | null>(null);

    useEffect(() => {
        fetchPackets();
    }, [storeId]);

    // Auto-sync media from storage when Media tab is selected
    useEffect(() => {
        if (activeType === "media") {
            syncMediaFromStorage();
        }
    }, [activeType, storeId]);

    const syncMediaFromStorage = async () => {
        // 1. List files in storage
        const { data: files } = await supabase.storage.from("site-assets").list();
        if (!files || files.length === 0) return;

        // 2. Get existing media packets
        const { data: existingPackets } = await supabase
            .from("content_packets")
            .select("data")
            .eq("store_id", storeId)
            .eq("type", "media");

        const existingFilenames = new Set(existingPackets?.map(p => p.data?.filename || p.data?.url?.split('/').pop()) || []);

        // 3. Create packets for new files
        let created = 0;
        for (const file of files) {
            // Skip folders/placeholders 
            if (!file.name || file.name.startsWith('.')) continue;

            if (!existingFilenames.has(file.name)) {
                const { data: publicUrlData } = supabase.storage.from("site-assets").getPublicUrl(file.name);

                await supabase.from("content_packets").insert({
                    store_id: storeId,
                    type: "media",
                    name: file.name,
                    data: {
                        url: publicUrlData.publicUrl,
                        filename: file.name,
                        mediaType: file.name.match(/\.(mp4|webm|mov)$/i) ? "video" : "image",
                        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                        caption: ""
                    }
                });
                created++;
            }
        }

        if (created > 0) {
            fetchPackets(); // Refresh the list
        }
    };

    const fetchPackets = async () => {
        const { data, error } = await supabase
            .from("content_packets")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false });

        if (!error && data) setPackets(data);
        setLoading(false);
    };

    const filteredPackets = packets.filter((p) => p.type === activeType).sort((a, b) => {
        // For media, sort by type (images first, then videos)
        if (activeType === "media") {
            const aIsVideo = a.data?.mediaType === "video";
            const bIsVideo = b.data?.mediaType === "video";
            if (aIsVideo !== bIsVideo) return aIsVideo ? 1 : -1;
        }
        // Then by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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

    // AI Media Generation Handler
    const handleAiGenerate = async () => {
        if (!aiGenPrompt.trim() || aiGenLoading) return;

        setAiGenLoading(true);
        setAiGenResult(null);

        try {
            const response = await fetch('/api/ai/generate-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiGenPrompt,
                    model: aiGenModel,
                    storeId
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Generation failed');
            }

            const result = await response.json();

            if (result.status === 'complete') {
                setAiGenResult({ url: result.url, type: result.type });

                // Auto-create media packet
                const modelInfo = AI_MEDIA_MODELS.find(m => m.id === aiGenModel);
                await supabase.from("content_packets").insert({
                    store_id: storeId,
                    type: "media",
                    name: `AI Generated - ${aiGenPrompt.slice(0, 30)}...`,
                    data: {
                        url: result.url,
                        mediaType: result.type,
                        alt: aiGenPrompt,
                        caption: `Generated with ${modelInfo?.name}`,
                        source: 'ai_generated'
                    }
                });

                fetchPackets(); // Refresh
                setAiGenPrompt("");
            } else if (result.status === 'processing') {
                setAiGenResult({ url: '', type: 'processing' });
            }
        } catch (error) {
            console.error('AI generation error:', error);
            alert(error instanceof Error ? error.message : 'Generation failed');
        } finally {
            setAiGenLoading(false);
        }
    };

    // Handle media file upload
    const handleMediaUpload = async (file: File) => {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const isVideo = file.type.startsWith('video/');

        const { error: uploadError } = await supabase.storage
            .from('site-assets')
            .upload(fileName, file);

        if (uploadError) {
            alert('Upload failed: ' + uploadError.message);
            setUploading(false);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('site-assets')
            .getPublicUrl(fileName);

        setUploading(false);
        return { url: publicUrl, mediaType: isVideo ? 'video' : 'image' };
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await handleMediaUpload(file);
        if (result) {
            setNewData({ ...newData, url: result.url, mediaType: result.mediaType });
        }
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
            case "media":
                return (
                    <div className="space-y-3">
                        {data.url ? (
                            <div className="relative">
                                {data.mediaType === 'video' ? (
                                    <video src={data.url} className="w-full h-32 object-cover rounded-lg" controls />
                                ) : (
                                    <img src={data.url} alt={data.alt} className="w-full h-32 object-cover rounded-lg" />
                                )}
                                <button
                                    onClick={() => setData({ ...data, url: '', mediaType: 'image' })}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition"
                            >
                                <Upload size={20} className="text-slate-400" />
                                <span className="text-sm text-slate-500">
                                    {uploading ? 'Uploading...' : 'Upload image or video'}
                                </span>
                            </button>
                        )}
                        <input
                            type="text"
                            placeholder="Alt text (for accessibility)"
                            value={data.alt || ""}
                            onChange={(e) => setData({ ...data, alt: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={data.caption || ""}
                            onChange={(e) => setData({ ...data, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                    </div>
                );
            case "stat":
                return (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Label (e.g., Customers)"
                            value={data.label || ""}
                            onChange={(e) => setData({ ...data, label: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Value (e.g., 10,000)"
                            value={data.value ?? ""}
                            onChange={(e) => setData({ ...data, value: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Prefix (optional, e.g. $)"
                                value={data.prefix || ""}
                                onChange={(e) => setData({ ...data, prefix: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Suffix (optional, e.g. +, %)"
                                value={data.suffix || ""}
                                onChange={(e) => setData({ ...data, suffix: e.target.value })}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Use these in a Stats Section by selecting them from the block’s Content Library.
                        </p>
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
            case "media":
                return (
                    <div>
                        {packet.data.url ? (
                            packet.data.mediaType === 'video' ? (
                                <div className="flex items-center gap-2">
                                    <Video size={16} className="text-purple-500" />
                                    <span className="text-sm text-slate-600">{packet.data.alt || 'Video'}</span>
                                </div>
                            ) : (
                                <img src={packet.data.url} alt={packet.data.alt} className="w-full h-20 object-cover rounded-lg" />
                            )
                        ) : (
                            <span className="text-sm text-slate-400">No media</span>
                        )}
                        {packet.data.caption && <p className="text-xs text-slate-500 mt-1">{packet.data.caption}</p>}
                    </div>
                );
            case "stat":
                return (
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{packet.data.label || "Untitled"}</p>
                            <p className="text-sm text-slate-500">
                                {(packet.data.prefix || "")}{packet.data.value || ""}{(packet.data.suffix || "")}
                            </p>
                        </div>
                        <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                            <BarChart3 size={18} />
                        </div>
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

            {/* Hidden file input for media uploads */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            {/* AI Media Generation - only show for Media tab */}
            {activeType === "media" && (
                <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Wand2 size={20} className="text-purple-600" />
                        <h3 className="font-semibold text-purple-900">AI Generate Media</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <select
                                value={aiGenModel}
                                onChange={(e) => setAiGenModel(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={aiGenLoading}
                            >
                                {AI_MEDIA_MODELS.map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                            </select>

                            <textarea
                                value={aiGenPrompt}
                                onChange={(e) => setAiGenPrompt(e.target.value)}
                                placeholder="Describe the image or video you want to generate..."
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={aiGenLoading}
                            />

                            <button
                                onClick={handleAiGenerate}
                                disabled={aiGenLoading || !aiGenPrompt.trim()}
                                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
                            >
                                {aiGenLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generate with AI
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            {aiGenResult && aiGenResult.type !== 'processing' ? (
                                <div className="w-full space-y-2">
                                    <img src={aiGenResult.url} alt="Generated" className="w-full h-32 object-cover rounded-lg" />
                                    <p className="text-xs text-center text-green-600 font-medium">✓ Added to your media library</p>
                                </div>
                            ) : aiGenResult?.type === 'processing' ? (
                                <div className="text-center p-4">
                                    <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
                                    <p className="text-sm text-purple-700">Video is processing...</p>
                                </div>
                            ) : (
                                <div className="text-center p-4 text-slate-400">
                                    <Image size={48} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Your generated media will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    <span className="text-sm font-medium">Add {PACKET_TYPES.find((t) => t.key === activeType)?.singular}</span>
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
                                    New {PACKET_TYPES.find((t) => t.key === activeType)?.singular}
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
