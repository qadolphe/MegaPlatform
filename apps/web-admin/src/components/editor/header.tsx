"use client";

import React from "react";
import { 
    ChevronLeft, 
    Monitor, 
    Smartphone, 
    Sparkles, 
    Wrench, 
    ExternalLink, 
    Rocket, 
    Undo, 
    Redo,
    LayoutDashboard,
    Home
} from "lucide-react";
import Link from "next/link";

interface EditorHeaderProps {
    storeId: string;
    pageSlug: string;
    pageName: string;
    availablePages: any[];
    router: any;
    setIsCreatePageOpen: (open: boolean) => void;
    viewMode: 'desktop' | 'mobile';
    setViewMode: (mode: 'desktop' | 'mobile') => void;
    editorMode: 'ai' | 'advanced';
    setEditorMode: (mode: 'ai' | 'advanced') => void;
    setActiveSidebarTab: (tab: any) => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    undo: () => void;
    redo: () => void;
    handleDeploy: () => void;
    baseDomain: string;
    storeSubdomain: string;
}

export function EditorHeader({
    storeId,
    pageSlug,
    pageName,
    availablePages,
    router,
    setIsCreatePageOpen,
    viewMode,
    setViewMode,
    editorMode,
    setEditorMode,
    setActiveSidebarTab,
    canUndo,
    canRedo,
    undo,
    redo,
    handleDeploy,
    baseDomain,
    storeSubdomain
}: EditorHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-[50]">
            <div className="flex items-center gap-4">
                <Link
                    href={`/store/${storeId}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="text-sm font-medium">Exit Editor</span>
                </Link>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={pageSlug}
                            onChange={(e) => {
                                const newSlug = e.target.value;
                                if (newSlug === 'new_page_action') {
                                    setIsCreatePageOpen(true);
                                } else {
                                    // Navigate to new page
                                    router.push(`/editor/${storeId}?slug=${newSlug}`);
                                }
                            }}
                            className="appearance-none bg-slate-800 text-white text-sm border border-slate-700 rounded pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700 transition min-w-[200px]"
                        >
                            {availablePages.map(p => (
                                <option key={p.slug} value={p.slug}>{p.name} (/{p.slug})</option>
                            ))}
                            <option disabled>──────────</option>
                            <option value="new_page_action">+ Create New Page</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* --- History --- */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={undo}
                        disabled={!canUndo()}
                        className={`p-1.5 rounded transition ${!canUndo() ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Undo"
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo()}
                        className={`p-1.5 rounded transition ${!canRedo() ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Redo"
                    >
                        <Redo size={16} />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-700 mx-2"></div>

                {/* --- Device Toggle --- */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1.5 rounded transition ${viewMode === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        title="Desktop View"
                    >
                        <Monitor size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1.5 rounded transition ${viewMode === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                </div>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                {/* AI Mode / Advanced Toggle */}
                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                    <button
                        onClick={() => {
                            setEditorMode('ai');
                            setActiveSidebarTab('ai');
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition text-xs font-medium ${editorMode === 'ai' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="AI Mode"
                    >
                        <Sparkles size={14} />
                        <span className="hidden lg:inline">AI Mode</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditorMode('advanced');
                            setActiveSidebarTab('components');
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition text-xs font-medium ${editorMode === 'advanced' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        title="Advanced Tweaks"
                    >
                        <Wrench size={14} />
                        <span className="hidden lg:inline">Advanced</span>
                    </button>
                </div>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <a
                    href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${storeSubdomain}` : `//${storeSubdomain}.${baseDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-md hover:bg-slate-700 hover:text-white transition text-sm font-medium"
                >
                    <ExternalLink size={16} /> Preview
                </a>
                <button
                    onClick={handleDeploy}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition text-sm font-medium shadow-sm"
                >
                    <Rocket size={16} /> Deploy
                </button>
            </div>
        </header>
    );
}
