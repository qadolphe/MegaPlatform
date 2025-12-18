"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus, Send, Bot, Database, RefreshCw, Package, FileText, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function KnowledgeView({ storeId }: { storeId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Chat state
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, [storeId]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ai/sync-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId })
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleIngest = async () => {
    if (!newItem.trim()) return;
    setIngesting(true);
    try {
      const res = await fetch("/api/ai/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newItem,
          storeId,
          metadata: { source: "user-input" }
        })
      });
      
      if (res.ok) {
        setNewItem("");
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIngesting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("knowledge_items").delete().eq("id", id);
    fetchItems();
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;
    setChatLoading(true);
    setChatResponse("");
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatQuery,
          context: { storeId } // Only passing storeId to trigger RAG
        })
      });
      
      const data = await res.json();
      if (data.action === "UPDATE_LAYOUT") {
         setChatResponse("I've generated a layout update based on your request (not applied here). " + (data.data?.message || ""));
      } else if (data.data && data.data.message) {
         setChatResponse(data.data.message);
      } else {
         setChatResponse(JSON.stringify(data));
      }
    } catch (e) {
      setChatResponse("Error communicating with AI.");
    } finally {
      setChatLoading(false);
    }
  };

  // Group items by type
  const groupedItems = {
    manual: items.filter(i => !i.metadata?.source || i.metadata.source === 'user-input'),
    products: items.filter(i => i.metadata?.type === 'product'),
    pages: items.filter(i => i.metadata?.type === 'page'),
    settings: items.filter(i => i.metadata?.type === 'settings'),
  };

  const renderGroup = (title: string, icon: any, groupItems: any[]) => {
    if (groupItems.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          {icon} {title} ({groupItems.length})
        </h3>
        <div className="space-y-2">
          {groupItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{item.content}</p>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 h-full">
      {/* Left Column: Knowledge Base Management */}
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600">
              <Database className="w-5 h-5 text-blue-600" />
              Knowledge Base
            </h2>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Website Data"}
            </button>
          </div>
          
          <p className="text-slate-500 text-sm mb-4">
            Add information about your brand, products, or policies. The AI will use this to answer questions and build your site.
          </p>
          
          <div className="flex gap-2 mb-6">
            <textarea
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="e.g. 'Our return policy allows returns within 30 days...'"
              className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
            <button
              onClick={handleIngest}
              disabled={ingesting || !newItem.trim()}
              className="bg-slate-900 text-white px-4 rounded-lg font-medium text-sm hover:bg-slate-800 disabled:opacity-50 flex flex-col items-center justify-center gap-1 min-w-[80px]"
            >
              {ingesting ? "Saving..." : <><Plus size={18} /> Add</>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {loading ? (
              <p className="text-center text-slate-400 py-4">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-400 py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No knowledge items yet. Add some above or sync your data!
              </p>
            ) : (
              <>
                {renderGroup("Manual Entries", <User size={14} />, groupedItems.manual)}
                {renderGroup("Products", <Package size={14} />, groupedItems.products)}
                {renderGroup("Pages", <FileText size={14} />, groupedItems.pages)}
                {renderGroup("Settings", <Settings size={14} />, groupedItems.settings)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: AI Chat Playground */}
      <div className="flex flex-col h-full">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-600">
            <Bot className="w-5 h-5 text-purple-600" />
            Ask Your Assistant
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Test how the AI understands your knowledge base.
          </p>

          <div className="flex-1 bg-slate-50 rounded-lg border border-slate-100 p-4 mb-4 overflow-y-auto">
            {chatResponse ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-purple-600" />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-800 leading-relaxed overflow-hidden prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown 
                    components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold my-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold my-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold my-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                    }}
                  >
                    {chatResponse}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                Ask a question to see the AI in action...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask about your store..."
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleChat}
              disabled={chatLoading || !chatQuery.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {chatLoading ? "..." : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
