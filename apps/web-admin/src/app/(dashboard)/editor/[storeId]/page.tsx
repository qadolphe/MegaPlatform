"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@repo/database";
import { Hero, InfoGrid, ProductGrid } from "@repo/ui-bricks"; // Import real components
import { useEditorStore } from "@/lib/store/editor-store";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { Save, Plus, Trash, Image as ImageIcon, Layers, Monitor, Smartphone, Settings, ChevronLeft, Upload, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { MediaManager } from "@/components/media-manager";
import Link from "next/link";

// Mapping for rendering on the Canvas
const RENDER_MAP: Record<string, any> = {
  Hero,
  BenefitsGrid: InfoGrid,
  InfoGrid,
  ProductGrid
};

export default function EditorPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { blocks, addBlock, updateBlockProps, selectBlock, selectedBlockId, setBlocks, removeBlock } = useEditorStore();
  
  const [loading, setLoading] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'components' | 'media' | 'properties'>('components');
  const [mediaPreview, setMediaPreview] = useState<{name: string, url: string}[]>([]);
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [activePropName, setActivePropName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Load initial data
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("store_pages")
        .select("layout_config")
        .eq("store_id", storeId)
        .eq("slug", "home") // Assuming editing 'home' page for MVP
        .single();
      
      if (data?.layout_config) {
        setBlocks(data.layout_config as any);
      }
      setLoading(false);
    }
    loadData();
    fetchMediaPreview();
  }, [storeId]);

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

  // 2. Save function
  const handleSave = async () => {
    const { error } = await supabase
      .from("store_pages")
      .update({ layout_config: blocks })
      .eq("store_id", storeId)
      .eq("slug", "home");

    if (error) alert("Error saving!");
    else alert("Saved successfully!");
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
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition">
                <ChevronLeft size={20} />
            </Link>
            <h1 className="font-semibold text-lg tracking-tight">Visual Editor</h1>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">Home Page</span>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded transition ${!isSidebarOpen ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
                {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
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
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition text-sm font-medium shadow-sm"
            >
                <Save size={16} /> Save
            </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16 w-full overflow-hidden">
        {/* --- LEFT: SIDEBAR (Merged) --- */}
        <div 
            className={`bg-white border-r border-slate-200 flex flex-col shadow-sm z-40 transition-all duration-300 ${
                isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'
            }`}
        >
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveSidebarTab('components')}
                    className={`flex-1 py-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeSidebarTab === 'components' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Layers size={16} /> Components
                </button>
                <button 
                    onClick={() => setActiveSidebarTab('properties')}
                    className={`flex-1 py-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeSidebarTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Settings size={16} /> Properties
                </button>
                <button 
                    onClick={() => setActiveSidebarTab('media')}
                    className={`flex-1 py-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeSidebarTab === 'media' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <ImageIcon size={16} /> Media
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeSidebarTab === 'components' && (
                    <div className="grid gap-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drag & Drop</p>
                        {Object.entries(COMPONENT_DEFINITIONS).map(([key, def]) => (
                            <button
                            key={key}
                            onClick={() => addBlock(key, def.defaultProps)}
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
                    </div>
                )}

                {activeSidebarTab === 'media' && (
                    <div className="flex flex-col gap-4">
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
                                            onClick={() => { navigator.clipboard.writeText(img.url); alert("URL Copied!"); }}
                                            className="text-xs bg-white text-slate-800 px-2 py-1 rounded shadow-sm font-medium"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSidebarTab === 'properties' && (
                    <>
                        {selectedBlock && selectedDef ? (
                        <div className="flex flex-col gap-5">
                            <div className="pb-4 border-b border-slate-100">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                    {selectedDef.label}
                                </span>
                            </div>

                            {selectedDef.fields.map((field) => (
                            <div key={field.name}>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                {field.label}
                                </label>
                                
                                {field.type === 'array' ? (
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
                                                {field.itemSchema?.map((subField: any) => (
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
                                                            <input
                                                                type={subField.type === 'number' ? 'number' : 'text'}
                                                                className="w-full border border-slate-300 rounded-md p-1.5 text-xs outline-none focus:border-blue-500"
                                                                value={item[subField.name] || ""}
                                                                onChange={(e) => {
                                                                    const newItems = [...(selectedBlock.props[field.name] || [])];
                                                                    newItems[index] = { ...newItems[index], [subField.name]: e.target.value };
                                                                    updateBlockProps(selectedBlock.id, { [field.name]: newItems });
                                                                }}
                                                            />
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
                                ) : (
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    value={selectedBlock.props[field.name] || ""}
                                    onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                                />
                                )}
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center p-4">
                            <Settings size={32} className="mb-3 opacity-20" />
                            <p className="text-sm">Select a block on the canvas to edit its properties.</p>
                        </div>
                        )}
                    </>
                )}
            </div>
        </div>

        {/* --- CENTER: CANVAS --- */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100/50">
            <div className="flex-1 overflow-y-auto p-8">
            <div className={`bg-white min-h-[800px] mx-auto shadow-xl shadow-slate-200/60 rounded-xl overflow-hidden border border-slate-200/60 transition-all duration-300 ${
                viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-6xl'
            }`}>
                {blocks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-20 gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Layers size={32} className="opacity-50" />
                    </div>
                    <p>Your canvas is empty. Add components from the left.</p>
                </div>
                ) : (
                blocks.map((block) => {
                    const Component = RENDER_MAP[block.type];
                    const isSelected = block.id === selectedBlockId;
                    
                    return (
                    <div 
                        key={block.id}
                        onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
                        className={`relative group transition-all duration-200 ${
                        isSelected 
                            ? "ring-2 ring-blue-500 ring-inset z-10" 
                            : "hover:ring-1 hover:ring-blue-300 hover:ring-inset"
                        }`}
                    >
                        {/* Render the actual UI Block */}
                        {Component ? <Component {...block.props} /> : <div className="p-4 bg-red-50 text-red-500">Unknown Block</div>}
                        
                        {/* Actions Overlay */}
                        {isSelected && (
                        <div className="absolute -top-3 -right-3 flex gap-1 z-50">
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
                    );
                })
                )}
            </div>
            </div>
        </div>


      </div>

      <MediaManager 
        isOpen={isMediaManagerOpen} 
        onClose={() => setIsMediaManagerOpen(false)} 
        onSelect={handleImageSelect} 
      />
    </div>
  );
}
