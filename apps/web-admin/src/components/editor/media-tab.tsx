"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, LayoutDashboard, Sparkles, Loader2, Wand2 } from "lucide-react";

interface MediaTabProps {
    openMediaManager: (propName: string | null) => void;
    syncMediaToPackets: () => void;
    mediaGenModel: string;
    setMediaGenModel: (model: string) => void;
    mediaGenLoading: boolean;
    mediaGenPrompt: string;
    setMediaGenPrompt: (prompt: string) => void;
    handleGenerateMedia: () => void;
    mediaGenResult: { url: string; type: string } | null;
    mediaPreview: Array<{ name: string, url: string }>;
}

export function MediaTab({
    openMediaManager,
    syncMediaToPackets,
    mediaGenModel,
    setMediaGenModel,
    mediaGenLoading,
    mediaGenPrompt,
    setMediaGenPrompt,
    handleGenerateMedia,
    mediaGenResult,
    mediaPreview
}: MediaTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
        >
            <div className="flex gap-2">
                <button
                    onClick={() => { openMediaManager(null); }}
                    className="flex-1 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                    <Upload size={16} /> Upload
                </button>
                <button
                    onClick={syncMediaToPackets}
                    className="flex-1 py-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 transition text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                    title="Create packets for existing files"
                >
                    <LayoutDashboard size={16} /> Sync
                </button>
            </div>

            {/* AI Media Generation */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200/50">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">AI Generate</span>
                </div>

                <select
                    value={mediaGenModel}
                    onChange={(e) => setMediaGenModel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                    disabled={mediaGenLoading}
                >
                    <option value="gemini-2.5-flash-image">🖼️ Gemini 2.5 Flash (Fast)</option>
                    <option value="gemini-3-pro-image-preview">🖼️ Gemini 3 Pro (Quality)</option>
                    <option value="veo-3.1-generate-preview">🎬 Veo 3.1 (Video)</option>
                </select>

                <textarea
                    value={mediaGenPrompt}
                    onChange={(e) => setMediaGenPrompt(e.target.value)}
                    placeholder="Describe the image or video you want to generate..."
                    className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={mediaGenLoading}
                />

                <button
                    onClick={handleGenerateMedia}
                    disabled={mediaGenLoading || !mediaGenPrompt.trim()}
                    className="w-full mt-2 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50"
                >
                    {mediaGenLoading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 size={14} />
                            Generate
                        </>
                    )}
                </button>

                {mediaGenResult && mediaGenResult.type !== 'processing' && (
                    <div className="mt-3 p-2 bg-white rounded-lg border border-green-200">
                        <img src={mediaGenResult.url} alt="Generated" className="w-full rounded" />
                        <button
                            onClick={() => navigator.clipboard.writeText(mediaGenResult.url)}
                            className="w-full mt-2 py-1.5 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition"
                        >
                            Copy URL
                        </button>
                    </div>
                )}

                {mediaGenResult?.type === 'processing' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Video is processing... Check back soon.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                {mediaPreview.map((img) => (
                    <div key={img.name} className="aspect-square relative group rounded-md overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                                onClick={(e) => {
                                    navigator.clipboard.writeText(img.url);
                                    const btn = e.currentTarget;
                                    const originalText = btn.innerText;
                                    btn.innerText = "Copied!";
                                    setTimeout(() => btn.innerText = originalText, 1000);
                                }}
                                className="text-xs bg-white text-slate-800 px-2 py-1 rounded shadow-sm font-medium"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
