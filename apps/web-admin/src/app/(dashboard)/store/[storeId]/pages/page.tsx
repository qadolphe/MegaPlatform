"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@repo/database";
import { Plus, Edit, Trash, FileText, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

type Page = {
  id: string;
  name: string;
  slug: string;
  updated_at: string;
  is_home: boolean;
};

export default function PagesList() {
  const params = useParams();
  const storeId = params.storeId as string;
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  useEffect(() => {
    fetchPages();
  }, [storeId]);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("store_pages")
      .select("*")
      .eq("store_id", storeId)
      .order("name");

    if (error) {
      console.error("Error fetching pages:", error);
    } else {
      setPages(data || []);
    }
    setLoading(false);
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
      .select()
      .single();

    if (error) {
      alert("Error creating page: " + error.message);
    } else {
      setPages([...pages, data]);
      setIsCreating(false);
      setNewPageName("");
      setNewPageSlug("");
    }
  };

  const handleSetHome = async (pageId: string) => {
    // 1. Unset current home
    await supabase
      .from("store_pages")
      .update({ is_home: false })
      .eq("store_id", storeId)
      .eq("is_home", true);

    // 2. Set new home
    const { error } = await supabase
      .from("store_pages")
      .update({ is_home: true })
      .eq("id", pageId);

    if (error) {
      alert("Error setting home page");
    } else {
      fetchPages();
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    const { error } = await supabase
      .from("store_pages")
      .delete()
      .eq("id", pageId);

    if (error) {
      alert("Error deleting page");
    } else {
      setPages(pages.filter(p => p.id !== pageId));
    }
  };

  if (loading) return <div className="p-8">Loading pages...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
            <p className="text-slate-500">Manage the pages for your store.</p>
        </div>
        <button 
            onClick={() => setIsCreating(true)}
            className="ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
        >
            <Plus size={18} /> Create Page
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">New Page</h3>
            <form onSubmit={handleCreatePage} className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Page Name</label>
                    <input 
                        type="text" 
                        value={newPageName}
                        onChange={(e) => {
                            setNewPageName(e.target.value);
                            if (!newPageSlug) {
                                setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                            }
                        }}
                        className="w-full border border-slate-300 rounded-md p-2"
                        placeholder="e.g. About Us"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                    <input 
                        type="text" 
                        value={newPageSlug}
                        onChange={(e) => setNewPageSlug(e.target.value)}
                        className="w-full border border-slate-300 rounded-md p-2"
                        placeholder="e.g. about-us"
                    />
                </div>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">URL Slug</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <span className="font-medium text-slate-900">{page.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">/{page.slug}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => handleSetHome(page.id)}
                                    className={`p-2 rounded-md transition ${page.is_home ? 'text-yellow-500 bg-yellow-50' : 'text-slate-300 hover:text-yellow-500 hover:bg-yellow-50'}`}
                                    title={page.is_home ? "Current Home Page" : "Set as Home Page"}
                                >
                                    <Star size={18} fill={page.is_home ? "currentColor" : "none"} />
                                </button>
                                <Link 
                                    href={`/editor/${storeId}?slug=${page.slug}`}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                                >
                                    <Edit size={14} /> Edit
                                </Link>
                                <button 
                                    onClick={() => handleDeletePage(page.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                    title="Delete Page"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {pages.length === 0 && (
                    <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                            No pages found. Create one to get started.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
