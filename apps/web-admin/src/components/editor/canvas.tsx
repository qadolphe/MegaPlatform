"use client";

import React from "react";
import { Layers, Plus, Sparkles, ArrowUp, ArrowDown, Trash } from "lucide-react";
import { RENDER_MAP } from "@/components/editor/render-map";

interface EditorCanvasProps {
    viewMode: 'desktop' | 'mobile';
    previewIframeRef: React.RefObject<HTMLIFrameElement | null>;
    storeId: string;
    pageSlug: string;
    storeColors: any;
    blocks: any[];
    hydratedBlocks: any[];
    selectedBlockId: string | null;
    selectBlock: (id: string | null) => void;
    moveBlock: (id: string, direction: 'up' | 'down') => void;
    removeBlock: (id: string) => void;
    setActiveSidebarTab: (tab: any) => void;
    setChatInput: (input: string) => void;
    setInsertIndex: (index: number | null) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    storeProducts: any[];
    storeTheme: string;
}

export function EditorCanvas({
    viewMode,
    previewIframeRef,
    storeId,
    pageSlug,
    storeColors,
    blocks,
    hydratedBlocks,
    selectedBlockId,
    selectBlock,
    moveBlock,
    removeBlock,
    setActiveSidebarTab,
    setChatInput,
    setInsertIndex,
    isSidebarOpen,
    setIsSidebarOpen,
    storeProducts,
    storeTheme
}: EditorCanvasProps) {
    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100/50">
            <div className="flex-1 overflow-y-auto p-8">
                {/* Mobile Mode: Use iframe for true responsive preview */}
                {viewMode === 'mobile' ? (
                    <div className="w-[375px] h-[667px] mx-auto shadow-xl shadow-slate-200/60 rounded-xl overflow-hidden border border-slate-200/60 bg-white">
                        <iframe
                            ref={previewIframeRef}
                            src={`/preview/${storeId}?slug=${pageSlug}`}
                            className="w-full h-full border-0"
                            title="Mobile Preview"
                        />
                    </div>
                ) : (
                    /* Desktop Mode: Direct rendering with selection overlays */
                    <div className="bg-slate-950 min-h-[800px] mx-auto shadow-xl shadow-slate-200/60 rounded-xl overflow-hidden border border-slate-200/60 transition-all duration-300 w-full max-w-6xl"
                        style={{
                            transform: 'scale(1)',
                            '--color-primary': storeColors.primary,
                            '--color-secondary': storeColors.secondary,
                            '--color-accent': storeColors.accent,
                            '--color-background': storeColors.background,
                            '--color-text': storeColors.text,
                            backgroundColor: storeColors.background,
                            color: storeColors.text
                        } as React.CSSProperties}
                        onClickCapture={(e) => {
                            // We handle link clicks elsewhere or via event delegation if needed in the parent
                        }}
                    >
                        {blocks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-20 gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Layers size={32} className="opacity-50" />
                                </div>
                                <p>Your canvas is empty. Add components from the left.</p>
                            </div>
                        ) : (
                            (hydratedBlocks.length > 0 ? hydratedBlocks : blocks).map((block, index) => {
                                const Component = RENDER_MAP[block.type];
                                const isSelected = block.id === selectedBlockId;
                                const isHeader = block.type === 'Header';
                                const isFooter = block.type === 'Footer';
                                const isFirstContentBlock = !isHeader && (index === 0 || (index === 1 && blocks[0].type === 'Header'));

                                // Inject Preview Data
                                let previewProps = { ...block.props };

                                // Inject showCart for Header in Editor
                                if (isHeader) {
                                    const hasProducts = storeProducts.length > 0;
                                    const hasStaticAddToCart = blocks.some(b => b.type === 'ProductDetail' && (b.props?.buttonAction === 'addToCart' || !b.props?.buttonAction));
                                    previewProps.showCart = hasProducts || hasStaticAddToCart;
                                }

                                // Inject Global Theme (matches Storefront behavior)
                                if (previewProps.animationStyle === 'theme') {
                                    previewProps.animationStyle = storeTheme;
                                }

                                if (block.type === 'ProductGrid') {
                                    if (block.props?.sourceType === 'manual' && Array.isArray(block.props?.productIds)) {
                                        const selectedIds = block.props.productIds;
                                        previewProps.products = storeProducts
                                            .filter(p => selectedIds.includes(p.id))
                                            .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id)); // Preserve order
                                    } else {
                                        const collectionId = block.props.collectionId || 'all';
                                        let filtered = [];
                                        if (collectionId === 'all') {
                                            filtered = storeProducts;
                                        } else {
                                            filtered = storeProducts.filter(p => p.collectionIds.includes(collectionId));
                                        }
                                        if (filtered.length > 0) {
                                            previewProps.products = filtered.slice(0, 8);
                                        }
                                    }
                                }

                                if (block.type === 'ProductDetail') {
                                    if (pageSlug.startsWith('products/')) {
                                        const productSlug = pageSlug.replace('products/', '');
                                        const product = storeProducts.find(p => p.slug === productSlug);
                                        if (product) {
                                            previewProps.product = product;
                                        }
                                    } else if (storeProducts.length > 0) {
                                        // Fallback: Show first product if not on a specific product page
                                        previewProps.product = storeProducts[0];
                                    }
                                }

                                if (block.type === 'UniversalGrid') {
                                    previewProps.products = storeProducts;
                                }

                                return (
                                    <div key={block.id}>
                                        {/* Insert Zone - Hide before Header */}
                                        {!isHeader && (
                                            <div className="h-4 -my-2 relative z-20 flex items-center justify-center group/insert opacity-0 hover:opacity-100 transition-all">
                                                <div className="w-full h-0.5 bg-blue-500 absolute top-1/2 left-0 right-0"></div>
                                                <button
                                                    onClick={() => {
                                                        setInsertIndex(index);
                                                        setActiveSidebarTab('components');
                                                        if (!isSidebarOpen) setIsSidebarOpen(true);
                                                    }}
                                                    className="relative z-10 bg-blue-600 text-white rounded-full p-1 shadow-sm transform hover:scale-110 transition"
                                                    title="Insert Component Here"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}

                                        <div
                                            onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
                                            className={`relative group transition-all duration-200 ${isSelected
                                                ? "ring-2 ring-blue-500 ring-inset z-10"
                                                : "hover:ring-1 hover:ring-blue-300 hover:ring-inset"
                                                }`}
                                        >
                                            {/* Render the actual UI Block */}
                                            {Component ? <Component {...previewProps} /> : <div className="p-4 bg-red-50 text-red-500">Unknown Block</div>}

                                            {/* Actions Overlay */}
                                            {isSelected && !isHeader && !isFooter && (
                                                <div className={`absolute right-4 flex gap-1.5 z-[60] ${isFirstContentBlock ? 'top-20' : 'top-4'}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSidebarTab('ai');
                                                            if (!isSidebarOpen) setIsSidebarOpen(true);
                                                            setChatInput(`I want to edit the ${block.type} section. `);
                                                        }}
                                                        className="bg-purple-600/90 backdrop-blur-sm text-white border border-white/10 p-2 rounded-lg shadow-lg hover:bg-purple-500 transition"
                                                        title="Edit with AI"
                                                    >
                                                        <Sparkles size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                                                        className="bg-slate-900/80 backdrop-blur-sm text-white border border-white/10 p-2 rounded-lg shadow-lg hover:bg-slate-800 transition"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                                                        className="bg-slate-900/80 backdrop-blur-sm text-white border border-white/10 p-2 rounded-lg shadow-lg hover:bg-slate-800 transition"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                        className="bg-red-600/90 backdrop-blur-sm text-white border border-white/10 p-2 rounded-lg shadow-lg hover:bg-red-500 transition"
                                                        title="Remove Block"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
