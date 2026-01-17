"use client";

import React from "react";
import { Rocket, ExternalLink } from "lucide-react";
import { MediaManager } from "@/components/media-manager";
import { PacketEditorDialog } from "@/components/packet-editor-dialog";
import { getPacketTypeForBlock } from "@/lib/packet-hydration";

interface EditorModalsProps {
    isMediaManagerOpen: boolean;
    setIsMediaManagerOpen: (open: boolean) => void;
    handleImageSelect: (url: string) => void;
    editingPacketId: string | null;
    setEditingPacketId: (id: string | null) => void;
    selectedBlock: any;
    storeId: string;
    refreshPackets: () => void;
    missingPagePath: string | null;
    setMissingPagePath: (path: string | null) => void;
    setNewPageSlug: (slug: string) => void;
    setNewPageName: (name: string) => void;
    setIsCreatePageOpen: (open: boolean) => void;
    isCreatePageOpen: boolean;
    newPageName: string;
    newPageSlug: string;
    handleCreatePage: (e: React.FormEvent) => void;
    deploySuccess: boolean;
    setDeploySuccess: (success: boolean) => void;
    baseDomain: string;
    storeSubdomain: string;
}

export function EditorModals({
    isMediaManagerOpen,
    setIsMediaManagerOpen,
    handleImageSelect,
    editingPacketId,
    setEditingPacketId,
    selectedBlock,
    storeId,
    refreshPackets,
    missingPagePath,
    setMissingPagePath,
    setNewPageSlug,
    setNewPageName,
    setIsCreatePageOpen,
    isCreatePageOpen,
    newPageName,
    newPageSlug,
    handleCreatePage,
    deploySuccess,
    setDeploySuccess,
    baseDomain,
    storeSubdomain
}: EditorModalsProps) {
    return (
        <>
            <MediaManager
                isOpen={isMediaManagerOpen}
                onClose={() => setIsMediaManagerOpen(false)}
                onSelect={handleImageSelect}
            />

            {/* Edit existing packet */}
            <PacketEditorDialog
                isOpen={!!editingPacketId}
                onClose={() => setEditingPacketId(null)}
                packetId={editingPacketId}
                packetType={selectedBlock ? (getPacketTypeForBlock(selectedBlock.type) || 'text_block') : 'text_block'}
                storeId={storeId}
                maxColumns={selectedBlock?.props?.columns}
                onSave={() => {
                    refreshPackets();
                }}
            />

            {/* Missing Page Dialog */}
            {missingPagePath && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Page Not Found</h3>
                        <p className="text-slate-600 mb-6">
                            The page <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">{missingPagePath}</code> hasn't been created yet.
                            Would you like to create it now?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setMissingPagePath(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!missingPagePath) return;
                                    const slug = missingPagePath.startsWith('/') ? missingPagePath.substring(1) : missingPagePath;
                                    const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    setNewPageSlug(slug);
                                    setNewPageName(name);
                                    setMissingPagePath(null);
                                    setIsCreatePageOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Create Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Page Modal */}
            {isCreatePageOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Create New Page</h3>
                        <form onSubmit={handleCreatePage}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Page Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded p-2"
                                    value={newPageName}
                                    onChange={(e) => {
                                        setNewPageName(e.target.value);
                                        if (!newPageSlug) setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                                    }}
                                    placeholder="e.g. Contact Us"
                                    autoFocus
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded p-2 bg-slate-50"
                                    value={newPageSlug}
                                    onChange={(e) => setNewPageSlug(e.target.value)}
                                    placeholder="e.g. contact-us"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatePageOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deploy Success Modal */}
            {deploySuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80]">
                    <div className="bg-white rounded-lg p-8 w-96 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Rocket size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">Deployment Successful!</h3>
                        <p className="text-slate-500 mb-6">
                            Your changes are now live. It may take a few moments for the cache to clear.
                        </p>
                        <div className="flex flex-col gap-3">
                            <a
                                href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${storeSubdomain}` : `//${storeSubdomain}.${baseDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} /> View Storefront
                            </a>
                            <button
                                onClick={() => setDeploySuccess(false)}
                                className="w-full py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                            >
                                Continue Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
