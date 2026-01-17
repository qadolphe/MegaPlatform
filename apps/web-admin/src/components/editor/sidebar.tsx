"use client";

import React from "react";
import { Layers, Settings, Image as ImageIcon, Bot, Palette } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SidebarTab } from "./types";
import { ComponentListTab } from "./component-list-tab";
import { PropertyEditorTab } from "./property-editor-tab";
import { MediaTab } from "./media-tab";
import { ThemeTab } from "./theme-tab";
import { AiChatTab } from "./ai-chat-tab";

interface EditorSidebarProps {
    editorMode: 'ai' | 'advanced';
    activeSidebarTab: SidebarTab;
    setActiveSidebarTab: (tab: SidebarTab) => void;
    // Props for tabs
    insertIndex: number | null;
    setInsertIndex: (index: number | null) => void;
    insertBlock: (index: number, type: string, props: any) => void;
    addBlock: (type: string, props: any) => void;
    blocks: any[];
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
    openMediaManager: (propName: string | null) => void;
    syncMediaToPackets: () => void;
    mediaGenModel: string;
    setMediaGenModel: (model: string) => void;
    mediaGenLoading: boolean;
    mediaGenPrompt: string;
    setMediaGenPrompt: (prompt: string) => void;
    handleGenerateMedia: () => void;
    mediaGenResult: { url: string; type: string } | null;
    mediaPreview: any[];
    storeTheme: string;
    setStoreTheme: (theme: string) => void;
    storeColors: any;
    setStoreColors: (colors: any, save: boolean) => void;
    colorsExpanded: boolean;
    setColorsExpanded: (expanded: boolean) => void;
    supabase: any;
    selectedAiProvider: 'gemini' | 'openai' | 'anthropic';
    setSelectedAiProvider: (provider: 'gemini' | 'openai' | 'anthropic') => void;
    selectedAiModel: string;
    setSelectedAiModel: (model: string) => void;
    AI_MODELS: Record<string, any[]>;
    chatMessages: any[];
    isChatLoading: boolean;
    chatInput: string;
    setChatInput: (input: string) => void;
    handleAiChat: (e?: React.FormEvent) => void;
    setEditingPacketId: (id: string | null) => void;
    refreshPackets: () => void;
}

export function EditorSidebar({
    editorMode,
    activeSidebarTab,
    setActiveSidebarTab,
    insertIndex,
    setInsertIndex,
    insertBlock,
    addBlock,
    blocks,
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
    syncMediaToPackets,
    mediaGenModel,
    setMediaGenModel,
    mediaGenLoading,
    mediaGenPrompt,
    setMediaGenPrompt,
    handleGenerateMedia,
    mediaGenResult,
    mediaPreview,
    storeTheme,
    setStoreTheme,
    storeColors,
    setStoreColors,
    colorsExpanded,
    setColorsExpanded,
    supabase,
    selectedAiProvider,
    setSelectedAiProvider,
    selectedAiModel,
    setSelectedAiModel,
    AI_MODELS,
    chatMessages,
    isChatLoading,
    chatInput,
    setChatInput,
    handleAiChat,
    setEditingPacketId,
    refreshPackets
}: EditorSidebarProps) {
    return (
        <div
            className={`bg-white border border-slate-200 flex flex-col shadow-xl z-40 m-4 rounded-xl overflow-hidden transition-all duration-300 ${editorMode === 'ai' ? 'w-96' : 'w-80'}`}
        >
            {/* Tabs - Show different tabs based on editor mode */}
            <div className="flex border-b border-slate-200">
                {editorMode === 'advanced' && (
                    <>
                        <button
                            onClick={() => setActiveSidebarTab('components')}
                            className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'components' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            title="Components"
                        >
                            <Layers size={20} />
                            {activeSidebarTab === 'components' && (
                                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('properties')}
                            className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'properties' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            title="Properties"
                        >
                            <Settings size={20} />
                            {activeSidebarTab === 'properties' && (
                                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSidebarTab('media')}
                            className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'media' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            title="Media"
                        >
                            <ImageIcon size={20} />
                            {activeSidebarTab === 'media' && (
                                <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                            )}
                        </button>
                    </>
                )}
                <button
                    onClick={() => setActiveSidebarTab('ai')}
                    className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'ai' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    title="AI Assistant"
                >
                    <Bot size={20} />
                    {editorMode === 'ai' && <span className="ml-2 text-sm font-medium">AI Assistant</span>}
                    {activeSidebarTab === 'ai' && (
                        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveSidebarTab('theme')}
                    className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'theme' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    title="Theme"
                >
                    <Palette size={20} />
                    {editorMode === 'ai' && <span className="ml-2 text-sm font-medium">Theme</span>}
                    {activeSidebarTab === 'theme' && (
                        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                    {activeSidebarTab === 'components' && (
                        <ComponentListTab
                            insertIndex={insertIndex}
                            setInsertIndex={setInsertIndex}
                            insertBlock={insertBlock}
                            addBlock={addBlock}
                            blocks={blocks}
                        />
                    )}

                    {activeSidebarTab === 'properties' && (
                        <PropertyEditorTab
                            selectedBlock={selectedBlock}
                            selectedDef={selectedDef}
                            openSections={openSections}
                            setOpenSections={setOpenSections}
                            updateBlockProps={updateBlockProps}
                            storeId={storeId}
                            collections={collections}
                            storeProducts={storeProducts}
                            availablePages={availablePages}
                            setIsCreatePageOpen={setIsCreatePageOpen}
                            openMediaManager={openMediaManager}
                            storeTheme={storeTheme}
                            setEditingPacketId={setEditingPacketId}
                            refreshPackets={refreshPackets}
                        />
                    )}

                    {activeSidebarTab === 'media' && (
                        <MediaTab
                            openMediaManager={openMediaManager}
                            syncMediaToPackets={syncMediaToPackets}
                            mediaGenModel={mediaGenModel}
                            setMediaGenModel={setMediaGenModel}
                            mediaGenLoading={mediaGenLoading}
                            mediaGenPrompt={mediaGenPrompt}
                            setMediaGenPrompt={setMediaGenPrompt}
                            handleGenerateMedia={handleGenerateMedia}
                            mediaGenResult={mediaGenResult}
                            mediaPreview={mediaPreview}
                        />
                    )}

                    {activeSidebarTab === 'theme' && (
                        <ThemeTab
                            storeTheme={storeTheme}
                            setStoreTheme={setStoreTheme}
                            storeColors={storeColors}
                            setStoreColors={setStoreColors}
                            colorsExpanded={colorsExpanded}
                            setColorsExpanded={setColorsExpanded}
                            storeId={storeId}
                            supabase={supabase}
                        />
                    )}

                    {activeSidebarTab === 'ai' && (
                        <AiChatTab
                            selectedAiProvider={selectedAiProvider}
                            setSelectedAiProvider={setSelectedAiProvider}
                            selectedAiModel={selectedAiModel}
                            setSelectedAiModel={setSelectedAiModel}
                            AI_MODELS={AI_MODELS}
                            chatMessages={chatMessages}
                            isChatLoading={isChatLoading}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            handleAiChat={handleAiChat}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
