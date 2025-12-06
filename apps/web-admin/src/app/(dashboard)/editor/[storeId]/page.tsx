"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@repo/database";
import { Hero, BenefitsGrid, ProductGrid } from "@repo/ui-bricks"; // Import real components
import { useEditorStore } from "@/lib/store/editor-store";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { Save, Plus, Trash } from "lucide-react";

// Mapping for rendering on the Canvas
const RENDER_MAP: Record<string, any> = {
  Hero,
  BenefitsGrid,
  ProductGrid
};

export default function EditorPage() {
  const { storeId } = useParams();
  const { blocks, addBlock, updateBlockProps, selectBlock, selectedBlockId, setBlocks, removeBlock } = useEditorStore();
  const [loading, setLoading] = useState(true);

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
  }, [storeId]);

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

  if (loading) return <div>Loading editor...</div>;

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const selectedDef = selectedBlock ? COMPONENT_DEFINITIONS[selectedBlock.type as keyof typeof COMPONENT_DEFINITIONS] : null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- LEFT: TOOLBOX --- */}
      <div className="w-64 bg-white border-r p-4 flex flex-col gap-4">
        <h2 className="font-bold text-gray-700">Components</h2>
        <div className="grid gap-2">
          {Object.entries(COMPONENT_DEFINITIONS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => addBlock(key, def.defaultProps)}
              className="flex items-center gap-2 p-3 border rounded hover:bg-blue-50 hover:border-blue-500 transition text-left"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">{def.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- CENTER: CANVAS --- */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b bg-white flex items-center justify-between px-6">
          <span className="font-semibold text-gray-500">Editing: Home Page</span>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white min-h-[800px] shadow-lg rounded-lg overflow-hidden">
            {blocks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 p-20">
                Click a component on the left to add it.
              </div>
            ) : (
              blocks.map((block) => {
                const Component = RENDER_MAP[block.type];
                const isSelected = block.id === selectedBlockId;
                
                return (
                  <div 
                    key={block.id}
                    onClick={(e) => { e.stopPropagation(); selectBlock(block.id); }}
                    className={`relative group border-2 transition-all ${
                      isSelected ? "border-blue-500" : "border-transparent hover:border-blue-200"
                    }`}
                  >
                    {/* Render the actual UI Block */}
                    {Component ? <Component {...block.props} /> : <div>Unknown Block</div>}
                    
                    {/* Delete Button (Visible on hover/select) */}
                    {isSelected && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded shadow-md z-50"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT: PROPERTIES --- */}
      <div className="w-80 bg-white border-l p-4">
        <h2 className="font-bold text-gray-700 mb-4">Properties</h2>
        {selectedBlock && selectedDef ? (
          <div className="flex flex-col gap-4">
            {selectedDef.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  {field.label}
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  value={selectedBlock.props[field.name] || ""}
                  onChange={(e) => updateBlockProps(selectedBlock.id, { [field.name]: e.target.value })}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Select a block on the canvas to edit its properties.</p>
        )}
      </div>
    </div>
  );
}
