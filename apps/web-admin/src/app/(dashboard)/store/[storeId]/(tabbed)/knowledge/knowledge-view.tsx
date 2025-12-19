"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus, Send, Bot, Database, RefreshCw, Package, FileText, Settings, User, MessageSquare, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function KnowledgeView({ storeId }: { storeId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  
  // Chat state
  const [chats, setChats] = useState<{id: string, title: string, messages: ChatMessage[]}[]>([
    { id: '1', title: 'New Chat', messages: [] }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>('1');
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat.messages;

  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, [storeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setChats(prev => [{ id: newId, title: 'New Chat', messages: [] }, ...prev]);
    setCurrentChatId(newId);
  };

  const updateCurrentChatMessages = (newMessages: ChatMessage[]) => {
    setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
            // Update title if it's the first user message
            let title = chat.title;
            if (chat.messages.length === 0 && newMessages.length > 0) {
                title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '');
            }
            return { ...chat, title, messages: newMessages };
        }
        return chat;
    }));
  };

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
    
    const userMsg = chatQuery;
    setChatQuery("");
    
    const updatedMessages = [...messages, { role: 'user', content: userMsg } as ChatMessage];
    updateCurrentChatMessages(updatedMessages);
    setChatLoading(true);
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          context: { storeId } // Only passing storeId to trigger RAG
        })
      });
      
      const data = await res.json();
      let aiMsg = "";
      
      if (data.action === "UPDATE_LAYOUT") {
         aiMsg = "I've generated a layout update based on your request (not applied here). " + (data.data?.message || "");
      } else if (data.data && data.data.message) {
         aiMsg = data.data.message;
      } else {
         aiMsg = JSON.stringify(data);
      }

      updateCurrentChatMessages([...updatedMessages, { role: 'assistant', content: aiMsg }]);

    } catch (e) {
      updateCurrentChatMessages([...updatedMessages, { role: 'assistant', content: "Error communicating with AI." }]);
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
    <div className="flex h-full">
      {/* Left Sidebar: Chat History (Mock for now) */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-200">
            <button 
                onClick={createNewChat}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
                <Plus size={16} />
                New Chat
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent</div>
            {chats.map(chat => (
                <button 
                    key={chat.id}
                    onClick={() => setCurrentChatId(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                        currentChatId === chat.id 
                            ? 'bg-white shadow-sm text-slate-900 font-medium' 
                            : 'text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    {chat.title}
                </button>
            ))}
        </div>
        <div className="p-4 border-t border-slate-200">
        </div>
        <div className="p-4 border-t border-slate-200">
            <button 
                onClick={() => setShowKnowledge(!showKnowledge)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showKnowledge ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-200'}`}
            >
                <span className="flex items-center gap-2">
                    <Database size={16} />
                    Knowledge Base
                </span>
                {showKnowledge ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-2">
                <Bot className="text-purple-600" size={20} />
                <span className="font-semibold text-slate-900">AI Assistant</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Beta</span>
            </div>
            {/* Mobile Toggle for Knowledge */}
            <button 
                onClick={() => setShowKnowledge(!showKnowledge)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
                <Database size={20} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Bot size={32} className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">How can I help you today?</h3>
                    <p className="text-slate-500 max-w-md">
                        I can help you write content, answer questions about your store, or suggest improvements based on your knowledge base.
                    </p>
                </div>
            ) : (
                messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={16} className="text-purple-600" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-slate-900 text-white rounded-tr-none' 
                                : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
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
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={16} className="text-slate-500" />
                            </div>
                        )}
                    </div>
                ))
            )}
            {chatLoading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={16} className="text-purple-600" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-3xl mx-auto relative">
                <input
                    type="text"
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Message AI Assistant..."
                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
                <button
                    onClick={handleChat}
                    disabled={chatLoading || !chatQuery.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
                AI can make mistakes. Check important info.
            </p>
        </div>
      </div>

      {/* Knowledge Base Drawer (Right Side Overlay) */}
      <AnimatePresence>
        {showKnowledge && (
            <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col"
            >
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Database size={18} className="text-blue-600" />
                        Knowledge Base
                    </h3>
                    <button 
                        onClick={() => setShowKnowledge(false)}
                        className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-200 bg-white">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing Website Data..." : "Sync Website Data"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex gap-2 mb-6">
                        <textarea
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Add new knowledge..."
                            className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                        />
                        <button
                            onClick={handleIngest}
                            disabled={ingesting || !newItem.trim()}
                            className="bg-slate-900 text-white px-3 rounded-lg font-medium text-sm hover:bg-slate-800 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                        >
                            {ingesting ? "..." : <Plus size={18} />}
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center text-slate-400 py-4">Loading...</p>
                    ) : items.length === 0 ? (
                        <p className="text-center text-slate-400 py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm">
                            No knowledge items yet.
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
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

