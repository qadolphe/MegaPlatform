"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Hero, InfoGrid, ProductGrid, Header, Footer, ProductDetail, TextContent, VideoGrid, ImageBox, Newsletter, CustomerProfile } from "@repo/ui-bricks"; // Import real components
import { useEditorStore } from "@/lib/store/editor-store";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { Save, Plus, Trash, Image as ImageIcon, Layers, Monitor, Smartphone, Settings, ChevronLeft, Upload, PanelLeftClose, PanelLeftOpen, ArrowUp, ArrowDown, Undo, Redo, Rocket, Palette, ExternalLink, Home, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaManager } from "@/components/media-manager";
import { CounterInput } from "@/components/ui/counter-input";
import Link from "next/link";

// Mapping for rendering on the Canvas
const RENDER_MAP: Record<string, any> = {
  Header,
  Footer,
  Hero,
  BenefitsGrid: InfoGrid,
  InfoGrid,
  ProductGrid,
  ProductDetail,
  TextContent,
  VideoGrid,
  ImageBox,
  Newsletter,
  CustomerProfile
};

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
  const [availablePages, setAvailablePages] = useState<{name: string, slug: string}[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'components' | 'media' | 'properties' | 'theme'>('components');
  const [mediaPreview, setMediaPreview] = useState<{name: string, url: string}[]>([]);
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

  // Product/Collection Data for Preview
  const [collections, setCollections] = useState<{id: string, title: string}[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);

  const [storeSubdomain, setStoreSubdomain] = useState<string>("");
  const [deploySuccess, setDeploySuccess] = useState(false);

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
    }
    loadData();
    fetchMediaPreview();
  }, [storeId, pageSlug]);

  // Autosave Effect
  useEffect(() => {
      if (!loading && blocks.length > 0) {
          const autosaveKey = `autosave_${storeId}_${pageSlug}`;
          localStorage.setItem(autosaveKey, JSON.stringify(blocks));
      }
  }, [blocks, loading, storeId, pageSlug]);

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

  // 2. Deploy function
  const handleDeploy = async () => {
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

  const openMediaManager = (propName: string) => {
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
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-16 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center gap-4">
            <Link href={`/store/${storeId}/pages`} className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-medium">
                <ChevronLeft size={18} />
                <span className="hidden md:inline">Back to Store</span>
            </Link>
            
            <div className="relative ml-4">
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
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
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
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded transition ${viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <Monitor size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded transition ${viewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <Smartphone size={16} />
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

      <div className="flex flex-1 pt-16 w-full overflow-hidden relative">
        {/* --- CENTER: CANVAS --- */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100/50">
            <div className="flex-1 overflow-y-auto p-8">
            <div className={`bg-slate-950 min-h-[800px] mx-auto shadow-xl shadow-slate-200/60 rounded-xl overflow-hidden border border-slate-200/60 transition-all duration-300 ${
                viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-6xl'
            }`} 
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
                const link = (e.target as HTMLElement).closest('a');
                if (link) {
                    e.preventDefault();
                    e.stopPropagation();
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('/')) {
                        const slug = href === '/' ? 'home' : href.substring(1);
                        
                        // Special handling for product pages
                        if (slug.startsWith('products/')) {
                            // Always allow navigation to product pages, even if not in availablePages list yet
                            // (because they might be dynamically generated or just created)
                            router.push(`/editor/${storeId}?slug=${slug}`);
                            return;
                        }

                        // Check if page exists
                        const pageExists = availablePages.some(p => p.slug === slug);
                        if (pageExists) {
                            router.push(`/editor/${storeId}?slug=${slug}`);
                        } else {
                            setMissingPagePath(href);
                        }
                    }
                }
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
                blocks.map((block, index) => {
                    const Component = RENDER_MAP[block.type];
                    const isSelected = block.id === selectedBlockId;
                    const isHeader = block.type === 'Header';
                    const isFooter = block.type === 'Footer';
                    
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
                            className={`relative group transition-all duration-200 ${
                            isSelected 
                                ? "ring-2 ring-blue-500 ring-inset z-10" 
                                : "hover:ring-1 hover:ring-blue-300 hover:ring-inset"
                            }`}
                        >
                            {/* Render the actual UI Block */}
                            {Component ? <Component {...previewProps} /> : <div className="p-4 bg-red-50 text-red-500">Unknown Block</div>}
                            
                            {/* Actions Overlay */}
                            {isSelected && !isHeader && !isFooter && (
                            <div className="absolute -top-3 -right-3 flex gap-1 z-50">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                                    className="bg-white text-slate-600 border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
                                    title="Move Up"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                                    className="bg-white text-slate-600 border border-slate-200 p-1.5 rounded-full shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
                                    title="Move Down"
                                >
                                    <ArrowDown size={14} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                    className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition transform hover:scale-105"
                                    title="Remove Block"
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                            )}
                        </div>
                    </div>
                    );
                })
                )}
                
                {/* Add at bottom button - Insert BEFORE Footer */}
                {/* REMOVED as per user request */}
            </div>
            </div>
        </div>

        {/* --- RIGHT: SIDEBAR (Floating Card) --- */}
        <div 
            className="bg-white border border-slate-200 flex flex-col shadow-xl z-40 w-80 m-4 rounded-xl overflow-hidden"
        >
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
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
                <button 
                    onClick={() => setActiveSidebarTab('theme')}
                    className={`flex-1 h-12 flex items-center justify-center transition-colors relative ${activeSidebarTab === 'theme' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    title="Theme"
                >
                    <Palette size={20} />
                    {activeSidebarTab === 'theme' && (
                        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600"></div>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                {activeSidebarTab === 'theme' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-5"
                    >
                        <div className="pb-4 border-b border-slate-100">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                Global Theme
                            </span>
                            <p className="text-xs text-slate-500 mt-2">
                                This theme controls the default animation style for all components set to "Theme Default".
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                Animation Style
                            </label>
                            <select
                                className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                value={storeTheme}
                                onChange={async (e) => {
                                    const newTheme = e.target.value;
                                    setStoreTheme(newTheme);
                                    await supabase
                                        .from("stores")
                                        .update({ theme: newTheme })
                                        .eq("id", storeId);
                                }}
                            >
                                <option value="simple">Simple (Fade Up)</option>
                                <option value="playful">Playful (Scale Up)</option>
                                <option value="elegant">Elegant (Fade In)</option>
                                <option value="dynamic">Dynamic (Slide In)</option>
                                <option value="none">None</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                                Global Colors
                            </label>
                            <div className="space-y-3">
                                {Object.entries(storeColors).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm capitalize text-slate-700">{key}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 uppercase">{value}</span>
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => {
                                                    const newColors = { ...storeColors, [key]: e.target.value };
                                                    setStoreColors(newColors, false);
                                                }}
                                                onBlur={async () => {
                                                     setStoreColors(storeColors, true);
                                                     await supabase
                                                        .from("stores")
                                                        .update({ colors: storeColors })
                                                        .eq("id", storeId);
                                                }}
                                                className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSidebarTab === 'components' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-3"
                    >
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drag & Drop</p>
                        {Object.entries(COMPONENT_DEFINITIONS)
                            .filter(([key]) => key !== 'Header' && key !== 'Footer')
                            .map(([key, def]) => (
                            <button
                            key={key}
                            onClick={() => {
                                if (insertIndex !== null) {
                                    insertBlock(insertIndex, key, def.defaultProps);
                                    setInsertIndex(null);
                                } else {
                                    // Default: Insert before Footer if it exists
                                    const footerIndex = blocks.findIndex(b => b.type === 'Footer');
                                    if (footerIndex !== -1) {
                                        insertBlock(footerIndex, key, def.defaultProps);
                                    } else {
                                        addBlock(key, def.defaultProps);
                                    }
                                }
                            }}
                            className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm hover:bg-blue-50/30 transition text-left group bg-white"
                            >
                            <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <Plus size={16} />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 block">{def.label}</span>
                                <span className="text-xs text-slate-400">Click to add</span>
                            </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {activeSidebarTab === 'media' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-4"
                    >
                        <button 
                            onClick={() => { setActivePropName(null); setIsMediaManagerOpen(true); }}
                            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Upload size={16} /> Upload New
                        </button>
                        
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
                )}

                {activeSidebarTab === 'properties' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {selectedBlock && selectedDef ? (
                        <div className="flex flex-col gap-5">
                            <div className="pb-4 border-b border-slate-100">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                    {selectedDef.label}
                                </span>
                            </div>

                            {/* Group fields by section */}
                            {(() => {
                                const fieldsBySection: Record<string, any[]> = {};
                                selectedDef.fields.forEach((field: any) => {
                                    const section = field.section || "Other";
                                    if (!fieldsBySection[section]) fieldsBySection[section] = [];
                                    fieldsBySection[section].push(field);
                                });

                                return Object.entries(fieldsBySection).map(([sectionName, fields]) => (
                                    <div key={sectionName} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{sectionName}</span>
                                        </div>
                                        <div className="p-3 space-y-4 bg-white">
                                            {fields.map((field) => {
                                                // Hide animation style for expandable cards
                                                if (field.name === 'animationStyle' && selectedBlock.props.layout === 'expandable') {
                                                    return null;
                                                }

                                                return (
                                                <div key={field.name}>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                                    {field.name === 'columns' && selectedBlock.props.layout === 'expandable' ? 'Products per row' : field.label}
                                                    </label>
                                                    
                                                    {field.type === 'collection-select' ? (
                                                        <select
                                                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                            value={selectedBlock.props[field.name] || "all"}
                                                            onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                        >
                                                            <option value="all">All Products</option>
                                                            {collections.map(c => (
                                                                <option key={c.id} value={c.id}>{c.title}</option>
                                                            ))}
                                                        </select>
                                                    ) : field.type === 'select' ? (
                                                        <select
                                                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                            value={selectedBlock.props[field.name] || ""}
                                                            onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                        >
                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                            {(field as any).options?.map((opt: any) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.value === 'theme' ? `Theme Default (${storeTheme})` : opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : field.type === 'array' ? (
                                                        <div className="space-y-3">
                                                            {(selectedBlock.props[field.name] || []).map((item: any, index: number) => (
                                                                <div key={index} className="border border-slate-200 rounded p-3 bg-slate-50">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="text-xs font-bold text-slate-400">Item {index + 1}</span>
                                                                        <button onClick={() => {
                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                            newItems.splice(index, 1);
                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                        }} className="text-red-400 hover:text-red-600"><Trash size={12} /></button>
                                                                    </div>
                                                                    {/* Render sub-fields */}
                                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                    {(field as any).itemSchema?.map((subField: any) => (
                                                                        <div key={subField.name} className="mb-2">
                                                                            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">{subField.label}</label>
                                                                            {subField.type === 'image' ? (
                                                                                <div className="flex gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none"
                                                                                        value={item[subField.name] || ""}
                                                                                        onChange={(e) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                    />
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            openMediaManager(`${field.name}:${index}:${subField.name}`);
                                                                                        }}
                                                                                        className="bg-slate-100 border border-slate-300 rounded-md px-2 hover:bg-slate-200 text-slate-600"
                                                                                    >
                                                                                        <Upload size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                subField.type === 'number' ? (
                                                                                    <CounterInput
                                                                                        value={parseInt(item[subField.name] || "0")}
                                                                                        onChange={(val) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: val };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                        min={(subField as any).min}
                                                                                        className="w-full"
                                                                                    />
                                                                                ) : (
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none focus:border-blue-500"
                                                                                        value={item[subField.name] || ""}
                                                                                        onChange={(e) => {
                                                                                            const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                                            newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                                            updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                                        }}
                                                                                    />
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                            <button onClick={() => {
                                                                const newItems = [...(selectedBlock.props[field.name] || []), {}];
                                                                updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                            }} className="w-full py-2 text-xs font-medium text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 flex items-center justify-center gap-1">
                                                                <Plus size={12} /> Add Item
                                                            </button>
                                                        </div>
                                                    ) : field.type === 'page-link' ? (
                                                        <div className="flex flex-col gap-2">
                                                            <select
                                                                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                                                                value={selectedBlock.props[field.name] || ""}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'CREATE_NEW') {
                                                                        setIsCreatePageOpen(true);
                                                                    } else {
                                                                        updateBlockProps(selectedBlock.id, { [field.name]: e.target.value });
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Select a page...</option>
                                                                {availablePages.map((page) => (
                                                                    <option key={page.slug} value={`/${page.slug}`}>
                                                                        {page.name || page.slug} (/{page.slug})
                                                                    </option>
                                                                ))}
                                                                <option value="CREATE_NEW" className="font-bold text-blue-600">+ Create New Page</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                placeholder="Or type custom URL..."
                                                                className="w-full border border-slate-300 rounded-md p-2 text-xs text-slate-500 focus:text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                value={selectedBlock.props[field.name] || ""}
                                                                onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                            />
                                                        </div>
                                                    ) : field.type === 'image' ? (
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                className="w-full border border-slate-300 rounded-md p-2 text-sm pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                                value={selectedBlock.props[field.name] || ""}
                                                                onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                            />
                                                            <div className="absolute left-2.5 top-2.5 text-slate-400">
                                                                <ImageIcon size={14} />
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => openMediaManager(field.name)}
                                                            className="bg-slate-100 border border-slate-300 rounded-md px-3 hover:bg-slate-200 text-slate-600 transition"
                                                            title="Select Image"
                                                        >
                                                            <Upload size={16} />
                                                        </button>
                                                    </div>
                                                    ) : field.type === 'number' ? (
                                                        <CounterInput
                                                            value={parseInt(selectedBlock.props[field.name] || "0")}
                                                            onChange={(val) => updateBlockProps(selectedBlock.id, { [field.name]: val })}
                                                            min={(field as any).min}
                                                            className="w-full"
                                                        />
                                                    ) : field.type === 'color' ? (
                                                        <div className="flex gap-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="color"
                                                                    className="h-9 w-9 rounded cursor-pointer border border-slate-300 p-0.5 overflow-hidden"
                                                                    value={selectedBlock.props[field.name] || "#000000"}
                                                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex gap-1">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                                                    value={selectedBlock.props[field.name] || ""}
                                                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                                    placeholder="Default (Global)"
                                                                />
                                                                {selectedBlock.props[field.name] && (
                                                                    <button 
                                                                        onClick={() => updateBlockProps(selectedBlock.id, { [field.name]: undefined })}
                                                                        className="p-2 text-slate-400 hover:text-red-500"
                                                                        title="Reset to Global Default"
                                                                    >
                                                                        <Undo size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                    <input
                                                        type="text"
                                                        className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                        value={selectedBlock.props[field.name] || ""}
                                                        onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                                    />
                                                    )}
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-4">
                            <Settings size={32} className="mb-3 opacity-20" />
                            <p className="text-sm">Select a block on the canvas to edit its properties.</p>
                        </div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>

      </div>

      <MediaManager 
        isOpen={isMediaManagerOpen} 
        onClose={() => setIsMediaManagerOpen(false)} 
        onSelect={handleImageSelect} 
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
    </div>
  );
}
