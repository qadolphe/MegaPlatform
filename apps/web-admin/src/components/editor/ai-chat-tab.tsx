"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface AiChatTabProps {
    selectedAiProvider: 'gemini' | 'openai' | 'anthropic';
    setSelectedAiProvider: (provider: 'gemini' | 'openai' | 'anthropic') => void;
    selectedAiModel: string;
    setSelectedAiModel: (model: string) => void;
    AI_MODELS: Record<string, any[]>;
    chatMessages: Array<{ role: 'user' | 'assistant', content: string }>;
    isChatLoading: boolean;
    chatInput: string;
    setChatInput: (input: string) => void;
    handleAiChat: (e?: React.FormEvent) => void;
}

export function AiChatTab({
    selectedAiProvider,
    setSelectedAiProvider,
    selectedAiModel,
    setSelectedAiModel,
    AI_MODELS,
    chatMessages,
    isChatLoading,
    chatInput,
    setChatInput,
    handleAiChat
}: AiChatTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
        >
            <div className="pb-4 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                    Smart Assistant
                </span>
            </div>

            {/* Model Selector */}
            <div className="pb-4 border-b border-slate-100 mb-4 space-y-2">
                <label className="text-xs font-medium text-slate-600">AI Model</label>
                <div className="flex gap-2">
                    <select
                        value={selectedAiProvider}
                        onChange={(e) => {
                            const provider = e.target.value as 'gemini' | 'openai' | 'anthropic';
                            setSelectedAiProvider(provider);
                            setSelectedAiModel(AI_MODELS[provider][0].id);
                        }}
                        className="flex-1 text-xs p-2 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="gemini">Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                    </select>
                    <select
                        value={selectedAiModel}
                        onChange={(e) => setSelectedAiModel(e.target.value)}
                        className="flex-1 text-xs p-2 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {AI_MODELS[selectedAiProvider].map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 p-1 mb-4">
                    {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 text-slate-500 p-3 rounded-lg rounded-bl-none text-sm flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" /> Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleAiChat} className="border-t border-slate-100 pt-4">
                    <div className="relative">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAiChat();
                                }
                            }}
                            placeholder="Ask me to add a section, change colors, or edit a block..."
                            className="w-full p-3 pr-10 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                            disabled={isChatLoading}
                        />
                        <button
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim()}
                            className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                        AI can make mistakes. Review generated changes.
                    </p>
                </form>
            </div>
        </motion.div>
    );
}
