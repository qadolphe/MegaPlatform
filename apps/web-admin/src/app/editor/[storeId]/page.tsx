"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store/editor-store";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { extractPacketIds, hydrateBlockWithPackets, ContentPacket } from "@/lib/packet-hydration";
import { LayoutBlockSchema } from "@/lib/schemas/component-props";
import { EditorHeader } from "@/components/editor/header";
import { EditorCanvas } from "@/components/editor/canvas";
import { EditorSidebar } from "@/components/editor/sidebar";
import { EditorModals } from "@/components/editor/modals";
import { DeployValidationModal } from "@/components/editor/validation-modal";
import { RENDER_MAP } from "@/components/editor/render-map";

export default function EditorPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const storeId = params.storeId as string;
    const pageSlug = searchParams.get("slug") || "home";
    const supabase = createClient();

    const { blocks, addBlock, insertBlock, moveBlock, updateBlockProps, selectBlock, selectedBlockId, setBlocks, removeBlock, undo, redo, canUndo, canRedo, storeColors, setStoreColors } = useEditorStore();

    const [loading, setLoading] = useState(true);
    const [pageName, setPageName] = useState("");
    const [storeTheme, setStoreTheme] = useState("simple");
    const [availablePages, setAvailablePages] = useState<{ name: string, slug: string }[]>([]);
    const [activeSidebarTab, setActiveSidebarTab] = useState<'components' | 'media' | 'properties' | 'theme' | 'ai'>('ai');
    const [editorMode, setEditorMode] = useState<'ai' | 'advanced'>('ai');
    const [mediaPreview, setMediaPreview] = useState<{ name: string, url: string }[]>([]);
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
    const [activePropName, setActivePropName] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [baseDomain, setBaseDomain] = useState("localhost:3000");

    // Create Page Modal State
    const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
    const [newPageName, setNewPageName] = useState("");
    const [newPageSlug, setNewPageSlug] = useState("");
    const [missingPagePath, setMissingPagePath] = useState<string | null>(null);
    const [editingPacketId, setEditingPacketId] = useState<string | null>(null);

    // Product/Collection Data for Preview
    const [collections, setCollections] = useState<{ id: string, title: string }[]>([]);
    const [storeProducts, setStoreProducts] = useState<any[]>([]);

    const [storeSubdomain, setStoreSubdomain] = useState<string>("");
    const [deploySuccess, setDeploySuccess] = useState(false);
    const [colorsExpanded, setColorsExpanded] = useState(false);

    const [deployValidationOpen, setDeployValidationOpen] = useState(false);
    const [deployValidationErrors, setDeployValidationErrors] = useState<Array<{ id: string; type: string; issues: Array<{ path: string; message: string }> }>>([]);

    // Media Generation State
    const [mediaGenPrompt, setMediaGenPrompt] = useState("");
    const [mediaGenModel, setMediaGenModel] = useState("gemini-2.5-flash-image");
    const [mediaGenLoading, setMediaGenLoading] = useState(false);
    const [mediaGenResult, setMediaGenResult] = useState<{ url: string; type: string } | null>(null);
    const [packetsMap, setPacketsMap] = useState<Map<string, ContentPacket>>(new Map());
    const [hydratedBlocks, setHydratedBlocks] = useState<any[]>([]);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        "Content": true,
        "Design": false,
        "Colors": false
    });

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hi! I'm your AI assistant. I can help you build your store, edit components, or change the theme. What would you like to do?" }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [selectedAiProvider, setSelectedAiProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
    const [selectedAiModel, setSelectedAiModel] = useState<string>('gemini-3-flash-preview');

    // Available models per provider
    const AI_MODELS = {
        gemini: [
            { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (preview)' },
            { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (preview)' },
        ],
        openai: [
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        ],
        anthropic: [
            { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
        ]
    };

    // Media Generation Handler
    const handleGenerateMedia = async () => {
        if (!mediaGenPrompt.trim() || mediaGenLoading) return;

        setMediaGenLoading(true);
        setMediaGenResult(null);

        try {
            const response = await fetch('/api/ai/generate-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: mediaGenPrompt,
                    model: mediaGenModel,
                    storeId
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Generation failed');
            }

            const result = await response.json();

            if (result.status === 'complete') {
                setMediaGenResult({ url: result.url, type: result.type });
                // Refresh media list
                const { data: files } = await supabase.storage.from('media').list(`stores/${storeId}`, { limit: 100 });
                if (files) {
                    const urls = files.filter(f => !f.name.startsWith('.')).map(f => ({
                        name: f.name,
                        url: supabase.storage.from('media').getPublicUrl(`stores/${storeId}/${f.name}`).data.publicUrl
                    }));
                    setMediaPreview(urls);
                }
            } else if (result.status === 'processing') {
                // Video is processing, show message
                setMediaGenResult({ url: '', type: 'processing' });
            }
        } catch (error) {
            console.error('Media generation error:', error);
            alert(error instanceof Error ? error.message : 'Generation failed');
        } finally {
            setMediaGenLoading(false);
        }
    };

    const handleAiChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            // Prepare Context
            const selectedBlock = blocks.find(b => b.id === selectedBlockId);

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userMessage,
                    modelConfig: {
                        provider: selectedAiProvider,
                        model: selectedAiModel
                    },
                    context: {
                        storeId,
                        selectedBlock: selectedBlock ? { type: selectedBlock.type, props: selectedBlock.props } : null,
                        allBlocks: blocks.map(b => ({ type: b.type, props: b.props })),
                        storeTheme,
                        storeColors,
                        availableImages: mediaPreview.map(m => m.url)
                    }
                })
            });

            if (!response.ok) throw new Error("Failed to fetch AI response");

            const result = await response.json();

            let assistantMessage = "";

            switch (result.action) {
                case 'CREATE_COMPONENT':
                    if (result.data?.type && result.data?.props) {
                        // Insert before Footer if exists
                        const footerIndex = blocks.findIndex(b => b.type === 'Footer');
                        if (footerIndex !== -1) {
                            insertBlock(footerIndex, result.data.type, result.data.props);
                        } else {
                            addBlock(result.data.type, result.data.props);
                        }
                        assistantMessage = `I've added a new ${result.data.type} section for you.`;
                    } else {
                        assistantMessage = "I tried to create a component but something went wrong.";
                    }
                    break;

                case 'UPDATE_COMPONENT':
                    if (selectedBlockId && result.data?.props) {
                        updateBlockProps(selectedBlockId, result.data.props);
                        assistantMessage = "I've updated the component properties.";
                    } else {
                        assistantMessage = "Please select a component first to update it.";
                    }
                    break;

                case 'UPDATE_LAYOUT':
                    if (result.data?.blocks && Array.isArray(result.data.blocks)) {
                        const newBlocks = result.data.blocks.map((b: any) => ({
                            ...b,
                            id: crypto.randomUUID()
                        }));
                        setBlocks(newBlocks);
                        assistantMessage = "I've updated the page layout as requested.";
                    } else {
                        assistantMessage = "I couldn't generate the new layout.";
                    }
                    break;

                case 'SET_THEME':
                    if (result.data?.theme) {
                        setStoreTheme(result.data.theme);
                        await supabase.from("stores").update({ theme: result.data.theme }).eq("id", storeId);
                    }
                    if (result.data?.colors) {
                        setStoreColors(result.data.colors, true);
                        await supabase.from("stores").update({ colors: result.data.colors }).eq("id", storeId);
                    }
                    assistantMessage = "I've updated the store theme and colors.";
                    break;

                case 'CREATE_TODO':
                    if (result.data?.title) {
                        try {
                            const { error } = await supabase.from("planner_tasks").insert({
                                store_id: storeId,
                                title: result.data.title,
                                description: result.data.description || "",
                                status: 'todo'
                            });
                            if (error) throw error;
                            assistantMessage = `I've added "${result.data.title}" to your planner.`;
                        } catch (e) {
                            console.error("Error creating todo:", e);
                            assistantMessage = "I failed to create the task.";
                        }
                    }
                    break;

                case 'CREATE_CONTENT_PACKET':
                    if (result.data?.type && result.data?.data) {
                        try {
                            const { error } = await supabase.from("content_packets").insert({
                                store_id: storeId,
                                type: result.data.type,
                                name: result.data.name || "AI Generated Content",
                                data: result.data.data
                            });
                            if (error) throw error;
                            assistantMessage = "I've saved that content to your library.";
                            // Refresh packets to show the new item immediately if needed
                            refreshPackets();
                        } catch (e) {
                            console.error("Error creating packet:", e);
                            assistantMessage = "I failed to save the content packet.";
                        }
                    } else {
                        assistantMessage = "I couldn't create the content packet. Missing data.";
                    }
                    break;

                case 'BUILD_PAGE':
                    if (result.data?.blocks && Array.isArray(result.data.blocks)) {
                        // Set theme if provided
                        if (result.data.theme) {
                            setStoreTheme(result.data.theme);
                            await supabase.from("stores").update({ theme: result.data.theme }).eq("id", storeId);
                        }
                        // Set colors if provided
                        if (result.data.colors) {
                            setStoreColors(result.data.colors, true);
                            await supabase.from("stores").update({ colors: result.data.colors }).eq("id", storeId);
                        }
                        // Set blocks
                        const newBlocks = result.data.blocks.map((b: any) => ({
                            ...b,
                            id: crypto.randomUUID()
                        }));
                        setBlocks(newBlocks);
                        assistantMessage = "🎉 I've built your page! I set the theme, colors, and created a complete layout with all the sections. Take a look at the preview!";
                    } else {
                        assistantMessage = "I couldn't generate the page layout.";
                    }
                    break;

                case 'CREATE_PRODUCTS':
                    if (result.data?.products && Array.isArray(result.data.products)) {
                        try {
                            const productsToInsert = result.data.products.map((p: any) => ({
                                store_id: storeId,
                                title: p.title,
                                description: p.description || "",
                                price: p.price || 0,
                                images: p.images || [],
                                slug: p.slug || p.title.toLowerCase().replace(/\s+/g, '-'),
                                published: true
                            }));

                            const { data: insertedProducts, error } = await supabase
                                .from("products")
                                .insert(productsToInsert)
                                .select();

                            if (error) throw error;

                            // Refresh products list
                            const { data: productsData } = await supabase
                                .from("products")
                                .select("*, product_collections(collection_id)")
                                .eq("store_id", storeId)
                                .eq("published", true);

                            if (productsData) {
                                setStoreProducts(productsData.map((p: any) => ({
                                    id: p.id,
                                    name: p.title,
                                    description: p.description,
                                    base_price: p.price,
                                    image_url: p.images?.[0] || p.image_url,
                                    slug: p.slug,
                                    collectionIds: p.product_collections?.map((pc: any) => pc.collection_id) || []
                                })));
                            }

                            assistantMessage = `✨ I've created ${result.data.products.length} products for your store! You can see them in the Products section or add a Product Grid to your page.`;
                        } catch (e) {
                            console.error("Error creating products:", e);
                            assistantMessage = "I failed to create the products.";
                        }
                    } else {
                        assistantMessage = "I couldn't generate the products.";
                    }
                    break;

                case 'GENERAL_CHAT':
                    assistantMessage = result.data?.message || "I'm not sure how to help with that.";
                    break;

                default:
                    assistantMessage = "I didn't understand that request.";
            }

            setChatMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

        } catch (error) {
            console.error("AI Chat Error:", error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsChatLoading(false);
        }
    };



    // 1. Load initial data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseDomain(window.location.host);
        }

        async function loadData() {
            const autosaveKey = `autosave_${storeId}_${pageSlug}`;
            const savedLocal = localStorage.getItem(autosaveKey);
            let loadedBlocks: any[] = [];

            const { data } = await supabase
                .from("store_pages")
                .select("layout_config, name")
                .eq("store_id", storeId)
                .eq("slug", pageSlug)
                .single();

            // Fetch store theme and subdomain
            const { data: storeData } = await supabase
                .from("stores")
                .select("theme, subdomain, colors")
                .eq("id", storeId)
                .single();

            if (storeData) {
                if (storeData.theme) setStoreTheme(storeData.theme);
                if (storeData.subdomain) setStoreSubdomain(storeData.subdomain);
                if (storeData.colors) setStoreColors(storeData.colors as any, false);
            }

            // Fetch Home Page Layout for Header/Footer consistency
            let homeHeader: any = null;
            let homeFooter: any = null;

            if (pageSlug !== 'home') {
                const { data: homeData } = await supabase
                    .from("store_pages")
                    .select("layout_config")
                    .eq("store_id", storeId)
                    .eq("slug", "home")
                    .single();

                if (homeData?.layout_config) {
                    const rawHeader = (homeData.layout_config as any[]).find((b: any) => b.type === 'Header');
                    const rawFooter = (homeData.layout_config as any[]).find((b: any) => b.type === 'Footer');

                    if (rawHeader) {
                        const def = COMPONENT_DEFINITIONS['Header'];
                        homeHeader = { ...rawHeader, props: { ...def?.defaultProps, ...rawHeader.props } };
                    }
                    if (rawFooter) {
                        const def = COMPONENT_DEFINITIONS['Footer'];
                        homeFooter = { ...rawFooter, props: { ...def?.defaultProps, ...rawFooter.props } };
                    }
                }
            }

            // 1. Determine Base Blocks (DB or Autosave)
            let baseBlocks: any[] = [];

            if (savedLocal) {
                try {
                    const parsed = JSON.parse(savedLocal);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        baseBlocks = parsed;
                    }
                } catch (e) {
                    console.error("Autosave parse error", e);
                }
            }

            // If no autosave or invalid, use DB data
            if (baseBlocks.length === 0 && data?.layout_config) {
                baseBlocks = data.layout_config as any[];
            } else if (baseBlocks.length === 0 && !data) {
                // If no data found (e.g. missing page), use default template
                if (pageSlug.startsWith('products/')) {
                    // Default Product Page Template
                    baseBlocks = [
                        { type: 'Header', props: {} },
                        { type: 'ProductDetail', props: {} },
                        { type: 'ProductGrid', props: { title: 'You May Also Like', columns: 4 } },
                        { type: 'Footer', props: {} }
                    ];
                } else {
                    // Default Empty Page
                    baseBlocks = [
                        { type: 'Header', props: {} },
                        { type: 'TextContent', props: { title: 'Page Not Found', body: 'This page does not exist yet.' } },
                        { type: 'Footer', props: {} }
                    ];
                }
            }

            if (data?.name) setPageName(data.name);

            // 2. Process Blocks: Merge Defaults & Inject Globals
            loadedBlocks = baseBlocks.map(b => {
                const def = COMPONENT_DEFINITIONS[b.type as keyof typeof COMPONENT_DEFINITIONS];
                return {
                    ...b,
                    id: b.id || crypto.randomUUID(),
                    props: { ...def?.defaultProps, ...b.props }
                };
            });

            // Inject Global Header/Footer if available and not on home page
            if (pageSlug !== 'home') {
                if (homeHeader) {
                    const currentHeaderIndex = loadedBlocks.findIndex(b => b.type === 'Header');
                    if (currentHeaderIndex !== -1) {
                        // Keep local ID but use global props
                        loadedBlocks[currentHeaderIndex] = { ...homeHeader, id: loadedBlocks[currentHeaderIndex].id };
                    } else {
                        // Prepend header
                        loadedBlocks.unshift({ ...homeHeader, id: crypto.randomUUID() });
                    }
                }
                if (homeFooter) {
                    const currentFooterIndex = loadedBlocks.findIndex(b => b.type === 'Footer');
                    if (currentFooterIndex !== -1) {
                        loadedBlocks[currentFooterIndex] = { ...homeFooter, id: loadedBlocks[currentFooterIndex].id };
                    } else {
                        // Append footer
                        loadedBlocks.push({ ...homeFooter, id: crypto.randomUUID() });
                    }
                }
            }

            setBlocks(loadedBlocks);

            // Fetch all pages for the link picker
            const { data: pagesData } = await supabase
                .from("store_pages")
                .select("name, slug")
                .eq("store_id", storeId);

            if (pagesData) {
                setAvailablePages(pagesData);
            }

            // Fetch collections
            const { data: collectionsData } = await supabase
                .from("collections")
                .select("id, title")
                .eq("store_id", storeId);
            if (collectionsData) setCollections(collectionsData);

            // Fetch products for preview
            const { data: productsData } = await supabase
                .from("products")
                .select("*, product_collections(collection_id)")
                .eq("store_id", storeId)
                .eq("published", true);

            if (productsData) {
                setStoreProducts(productsData.map((p: any) => ({
                    id: p.id,
                    name: p.title, // ProductCard expects 'name'
                    description: p.description,
                    base_price: p.price, // ProductCard expects 'base_price'
                    image_url: p.images?.[0] || p.image_url, // ProductCard expects 'image_url'
                    slug: p.slug,
                    collectionIds: p.product_collections?.map((pc: any) => pc.collection_id) || []
                })));
            }

            setLoading(false);
            setLoading(false);
        }

        loadData();
    }, [storeId, pageSlug]);

    // Autosave Effect
    useEffect(() => {
        if (!loading && blocks.length > 0) {
            const autosaveKey = `autosave_${storeId}_${pageSlug}`;
            localStorage.setItem(autosaveKey, JSON.stringify(blocks));
        }
    }, [blocks, loading, storeId, pageSlug]);

    // Preview iframe ref for mobile mode
    const previewIframeRef = React.useRef<HTMLIFrameElement>(null);
    const [previewReady, setPreviewReady] = useState(false);

    // Listen for preview ready message
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PREVIEW_READY') {
                setPreviewReady(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Send layout updates to preview iframe
    useEffect(() => {
        if (previewReady && previewIframeRef.current && viewMode === 'mobile') {
            previewIframeRef.current.contentWindow?.postMessage({
                type: 'PREVIEW_UPDATE',
                layout: blocks,
                colors: storeColors,
                theme: storeTheme,
                products: storeProducts,
            }, '*');
        }
    }, [blocks, storeColors, storeTheme, storeProducts, previewReady, viewMode]);

    const fetchMediaPreview = async () => {
        const { data } = await supabase.storage.from("site-assets").list();
        if (data) {
            const imageUrls = data.slice(0, 20).map((file) => { // Limit to 20 for sidebar
                const { data: publicUrlData } = supabase.storage.from("site-assets").getPublicUrl(file.name);
                return { name: file.name, url: publicUrlData.publicUrl };
            });
            setMediaPreview(imageUrls);
        }
    };

    // Fetch media preview on load
    useEffect(() => {
        fetchMediaPreview();
    }, []);

    const syncMediaToPackets = async () => {
        setLoading(true);
        try {
            // 1. List files
            const { data: files } = await supabase.storage.from("site-assets").list();
            if (!files) return;

            // 2. Fetch existing media packets
            const { data: existingPackets } = await supabase
                .from("content_packets")
                .select("data")
                .eq("type", "media")
                .eq("store_id", storeId);

            const existingFilenames = new Set(existingPackets?.map(p => p.data.filename) || []);

            let createdCount = 0;
            for (const file of files) {
                if (!existingFilenames.has(file.name)) {
                    const { data: publicUrlData } = supabase.storage.from("site-assets").getPublicUrl(file.name);

                    await supabase.from("content_packets").insert({
                        store_id: storeId,
                        type: "media",
                        name: file.name,
                        data: {
                            url: publicUrlData.publicUrl,
                            filename: file.name,
                            type: "image",
                            alt: file.name,
                            caption: ""
                        }
                    });
                    createdCount++;
                }
            }

            if (createdCount > 0) {
                // alert(`Synced ${createdCount} new media items to Content Library.`);
                refreshPackets();
            }
        } catch (e) {
            console.error("Sync error:", e);
        } finally {
            setLoading(false);
        }
    };

    const refreshPackets = async () => {
        const packetsNeeded = extractPacketIds(blocks);
        if (packetsNeeded.length > 0) {
            const { data } = await supabase
                .from('content_packets')
                .select('*')
                .in('id', packetsNeeded);

            if (data) {
                const newMap = new Map(packetsMap);
                data.forEach((p: any) => newMap.set(p.id, p));
                setPacketsMap(newMap);

                const hydrated = blocks.map(block => hydrateBlockWithPackets(block, newMap));
                setHydratedBlocks(hydrated);
            }
        } else {
            setHydratedBlocks(blocks);
        }
    };

    useEffect(() => {
        refreshPackets();
    }, [blocks]);

    // 2. Deploy function
    const handleDeploy = async () => {
        // Validation
        const invalidBlocks: Array<{ id: string; type: string; issues: Array<{ path: string; message: string }> }> = [];
        blocks.forEach(block => {
            const result = LayoutBlockSchema.safeParse(block);
            if (!result.success) {
                console.error(`Invalid Block ${block.type}:`, result.error);
                invalidBlocks.push({
                    id: block.id,
                    type: block.type,
                    issues: result.error.issues.map(i => ({
                        path: i.path.length ? i.path.join('.') : '(root)',
                        message: i.message
                    }))
                });
            }
        });

        if (invalidBlocks.length > 0) {
            console.warn("Deploy blocked due to invalid blocks:", invalidBlocks);
            setDeployValidationErrors(invalidBlocks);
            setDeployValidationOpen(true);
            return;
        }

        // 1. Save current page
        const { error } = await supabase
            .from("store_pages")
            .update({ layout_config: blocks })
            .eq("store_id", storeId)
            .eq("slug", pageSlug);

        if (error) {
            console.error("Error deploying!", error);
            return;
        }

        // 2. If Header/Footer changed, update Home Page (Global Source)
        // Only if we are NOT on the home page (if we are on home page, step 1 already saved it)
        if (pageSlug !== 'home') {
            const currentHeader = blocks.find(b => b.type === 'Header');
            const currentFooter = blocks.find(b => b.type === 'Footer');

            if (currentHeader || currentFooter) {
                const { data: homeData } = await supabase
                    .from("store_pages")
                    .select("layout_config")
                    .eq("store_id", storeId)
                    .eq("slug", "home")
                    .single();

                if (homeData && homeData.layout_config) {
                    let homeBlocks = [...(homeData.layout_config as any[])];
                    let changed = false;

                    if (currentHeader) {
                        const homeHeaderIndex = homeBlocks.findIndex(b => b.type === 'Header');
                        if (homeHeaderIndex !== -1) {
                            // Check if props are different
                            if (JSON.stringify(homeBlocks[homeHeaderIndex].props) !== JSON.stringify(currentHeader.props)) {
                                homeBlocks[homeHeaderIndex] = { ...homeBlocks[homeHeaderIndex], props: currentHeader.props };
                                changed = true;
                            }
                        }
                    }

                    if (currentFooter) {
                        const homeFooterIndex = homeBlocks.findIndex(b => b.type === 'Footer');
                        if (homeFooterIndex !== -1) {
                            if (JSON.stringify(homeBlocks[homeFooterIndex].props) !== JSON.stringify(currentFooter.props)) {
                                homeBlocks[homeFooterIndex] = { ...homeBlocks[homeFooterIndex], props: currentFooter.props };
                                changed = true;
                            }
                        }
                    }

                    if (changed) {
                        await supabase
                            .from("store_pages")
                            .update({ layout_config: homeBlocks })
                            .eq("store_id", storeId)
                            .eq("slug", "home");
                    }
                }
            }
        }

        // alert("Deployed successfully!");
        localStorage.removeItem(`autosave_${storeId}_${pageSlug}`);

        // Show success modal
        setDeploySuccess(true);
    };

    const handleImageSelect = (url: string) => {
        if (selectedBlockId && activePropName) {
            if (activePropName.includes(':')) {
                // Handle nested array update
                const [fieldName, indexStr, subFieldName] = activePropName.split(':');
                const index = parseInt(indexStr);
                const selectedBlock = blocks.find(b => b.id === selectedBlockId);
                if (selectedBlock) {
                    const newItems = [...(selectedBlock.props[fieldName] || [])];
                    newItems[index] = { ...newItems[index], [subFieldName]: url };
                    updateBlockProps(selectedBlockId, { [fieldName]: newItems });
                }
            } else {
                updateBlockProps(selectedBlockId, { [activePropName]: url });
            }
        }
        setIsMediaManagerOpen(false);
        setActivePropName(null);
        fetchMediaPreview(); // Refresh sidebar
    };

    const handleCreatePage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPageName || !newPageSlug) return;

        const { data, error } = await supabase
            .from("store_pages")
            .insert([
                {
                    store_id: storeId,
                    name: newPageName,
                    slug: newPageSlug.toLowerCase().replace(/\s+/g, "-"),
                    layout_config: [
                        { id: crypto.randomUUID(), type: "Header", props: { logoText: newPageName } },
                        { id: crypto.randomUUID(), type: "Footer", props: {} }
                    ]
                }
            ])
            .select("name, slug")
            .single();

        if (error) {
            console.error("Error creating page: " + error.message);
        } else {
            setAvailablePages([...availablePages, data]);
            setIsCreatePageOpen(false);
            setNewPageName("");
            setNewPageSlug("");
            setMissingPagePath(null);
            // alert("Page created! You can now select it from the dropdown.");
        }
    };

    const openMediaManager = (propName: string | null) => {
        setActivePropName(propName);
        setIsMediaManagerOpen(true);
    };

    // Auto-switch to properties tab when a block is selected
    useEffect(() => {
        if (selectedBlockId) {
            setActiveSidebarTab('properties');
            if (!isSidebarOpen) setIsSidebarOpen(true);
        }
    }, [selectedBlockId]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading editor...</div>;

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);
    const selectedDef = selectedBlock ? COMPONENT_DEFINITIONS[selectedBlock.type as keyof typeof COMPONENT_DEFINITIONS] : null;

    return (
        <>
            <DeployValidationModal
                isOpen={deployValidationOpen}
                onClose={() => setDeployValidationOpen(false)}
                errors={deployValidationErrors}
            />

            <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900 pl-16">
            <EditorHeader
                storeId={storeId}
                pageSlug={pageSlug}
                pageName={pageName}
                availablePages={availablePages}
                router={router}
                setIsCreatePageOpen={setIsCreatePageOpen}
                viewMode={viewMode}
                setViewMode={setViewMode}
                editorMode={editorMode}
                setEditorMode={setEditorMode}
                setActiveSidebarTab={setActiveSidebarTab}
                canUndo={canUndo}
                canRedo={canRedo}
                undo={undo}
                redo={redo}
                handleDeploy={handleDeploy}
                baseDomain={baseDomain}
                storeSubdomain={storeSubdomain}
            />

            <div className="flex flex-1 pt-16 w-full overflow-hidden relative">
                <EditorCanvas
                    viewMode={viewMode}
                    previewIframeRef={previewIframeRef}
                    storeId={storeId}
                    pageSlug={pageSlug}
                    storeColors={storeColors}
                    blocks={blocks}
                    hydratedBlocks={hydratedBlocks}
                    selectedBlockId={selectedBlockId}
                    selectBlock={selectBlock}
                    moveBlock={moveBlock}
                    removeBlock={removeBlock}
                    setActiveSidebarTab={setActiveSidebarTab}
                    setChatInput={setChatInput}
                    setInsertIndex={setInsertIndex}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    storeProducts={storeProducts}
                    storeTheme={storeTheme}
                />

                <EditorSidebar
                    editorMode={editorMode}
                    activeSidebarTab={activeSidebarTab as any}
                    setActiveSidebarTab={setActiveSidebarTab as any}
                    insertIndex={insertIndex}
                    setInsertIndex={setInsertIndex}
                    insertBlock={insertBlock}
                    addBlock={addBlock}
                    blocks={blocks}
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
                    syncMediaToPackets={syncMediaToPackets}
                    mediaGenModel={mediaGenModel}
                    setMediaGenModel={setMediaGenModel}
                    mediaGenLoading={mediaGenLoading}
                    mediaGenPrompt={mediaGenPrompt}
                    setMediaGenPrompt={setMediaGenPrompt}
                    handleGenerateMedia={handleGenerateMedia}
                    mediaGenResult={mediaGenResult}
                    mediaPreview={mediaPreview}
                    storeTheme={storeTheme}
                    setStoreTheme={setStoreTheme}
                    storeColors={storeColors}
                    setStoreColors={setStoreColors}
                    colorsExpanded={colorsExpanded}
                    setColorsExpanded={setColorsExpanded}
                    supabase={supabase}
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
                    setEditingPacketId={setEditingPacketId}
                    refreshPackets={refreshPackets}
                />
            </div>

            <EditorModals
                isMediaManagerOpen={isMediaManagerOpen}
                setIsMediaManagerOpen={setIsMediaManagerOpen}
                handleImageSelect={handleImageSelect}
                editingPacketId={editingPacketId}
                setEditingPacketId={setEditingPacketId}
                selectedBlock={selectedBlock}
                storeId={storeId}
                refreshPackets={refreshPackets}
                missingPagePath={missingPagePath}
                setMissingPagePath={setMissingPagePath}
                setIsCreatePageOpen={setIsCreatePageOpen}
                setNewPageSlug={setNewPageSlug}
                setNewPageName={setNewPageName}
                isCreatePageOpen={isCreatePageOpen}
                newPageName={newPageName}
                newPageSlug={newPageSlug}
                handleCreatePage={handleCreatePage}
                deploySuccess={deploySuccess}
                setDeploySuccess={setDeploySuccess}
                baseDomain={baseDomain}
                storeSubdomain={storeSubdomain}
            />
        </div>
        </>
    );
}
