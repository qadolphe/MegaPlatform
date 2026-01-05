"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash, FileText, Star, Package, Code2, AlertTriangle, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const supabase = createClient();

  // Developer Mode state
  const [developerMode, setDeveloperMode] = useState(false);
  const [showDevModeDialog, setShowDevModeDialog] = useState(false);
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    console.log("Fetching pages for store:", storeId);
    if (storeId) {
      fetchPages();
      fetchStoreSettings();
    }
  }, [storeId]);

  const fetchStoreSettings = async () => {
    const { data } = await supabase
      .from("stores")
      .select("developer_mode, subdomain")
      .eq("id", storeId)
      .single();
    if (data) {
      setDeveloperMode(data.developer_mode || false);
      setSubdomain(data.subdomain || "");
    }
  };

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("store_pages")
      .select("*")
      .eq("store_id", storeId)
      .order("name");

    if (error) {
      console.error("Error fetching pages:", error);
    } else {
      const filteredPages = (data || []).filter((p: Page) => !p.slug.startsWith('products/'));
      setPages(filteredPages);
    }

    const { data: productsData } = await supabase
      .from("products")
      .select("id, title, slug")
      .eq("store_id", storeId)
      .order("title");

    setProducts(productsData || []);
    setLoading(false);
  };

  const handleToggleDeveloperMode = async () => {
    const newValue = !developerMode;
    const { error } = await supabase
      .from("stores")
      .update({ developer_mode: newValue })
      .eq("id", storeId);

    if (error) {
      alert("Error updating developer mode: " + error.message);
    } else {
      setDeveloperMode(newValue);
      setShowDevModeDialog(false);
    }
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
    await supabase
      .from("store_pages")
      .update({ is_home: false })
      .eq("store_id", storeId)
      .eq("is_home", true);

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
    <>
      {/* Developer Mode Confirmation Dialog */}
      <AnimatePresence>
        {showDevModeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDevModeDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Code2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {developerMode ? "Disable Developer Mode?" : "Enable Advanced Developer Mode?"}
                      </h3>
                      <p className="text-sm text-slate-500">This change takes effect immediately</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDevModeDialog(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!developerMode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 mb-2">The following changes will take effect:</p>
                          <ul className="text-sm text-amber-700 space-y-1.5">
                            <li>• The <strong>Webstore Editor</strong> will be disabled</li>
                            <li>• Your deployed site at <code className="bg-amber-100 px-1 rounded">{subdomain}.swatbloc.com</code> will be paused</li>
                            <li>• All your pages, products, and content will be <strong>saved</strong></li>
                            <li>• You can re-enable this at any time</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-700 mb-2">
                        <strong>Why use Developer Mode?</strong>
                      </p>
                      <p className="text-sm text-slate-600">
                        Deploy your own custom storefront (built with Cursor, Lovable, Next.js, etc.) while still using SwatBloc's dashboard, product management, and SDK for your backend.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700">
                      Re-enabling will restore your Webstore Editor and deployed site at <code className="bg-green-100 px-1 rounded">{subdomain}.swatbloc.com</code>.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowDevModeDialog(false)}
                  className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleDeveloperMode}
                  className={`px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2 ${developerMode
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                >
                  {developerMode ? "Disable Developer Mode" : "Enable Developer Mode"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* Developer Mode Banner */}
        {developerMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">Developer Mode is enabled</p>
                <p className="text-xs text-amber-600">Webstore editor and deployed site are paused. Use the SDK to power your custom frontend.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDevModeDialog(true)}
              className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition"
            >
              Disable
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <div className="flex items-center gap-3">
            {/* Developer Mode Toggle */}
            <button
              onClick={() => setShowDevModeDialog(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition ${developerMode
                  ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Code2 size={18} />
              Developer Mode
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${developerMode ? "bg-amber-200 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                {developerMode ? "ON" : "OFF"}
              </span>
            </button>

            {!developerMode && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus size={18} /> Create Page
              </button>
            )}
          </div>
        </div>

        {developerMode ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Code2 size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Developer Mode Active</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              The visual editor is disabled. Use the SwatBloc SDK to fetch your products and power your custom frontend.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`/store/${storeId}/settings`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                <Code2 size={16} />
                Get API Keys
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <ExternalLink size={16} />
                View SDK Docs
              </Link>
            </div>
          </div>
        ) : (
          <>
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

            {/* Product Pages Section */}
            <div className="mt-12">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Product Pages</h2>
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">URL Slug</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                              <Package size={16} />
                            </div>
                            <span className="font-medium text-slate-900">{product.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">/products/{product.slug}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                const slug = `products/${product.slug}`;
                                const { data: existingPage } = await supabase
                                  .from("store_pages")
                                  .select("id")
                                  .eq("store_id", storeId)
                                  .eq("slug", slug)
                                  .single();

                                if (!existingPage) {
                                  const { error } = await supabase
                                    .from("store_pages")
                                    .insert([
                                      {
                                        store_id: storeId,
                                        name: `Product: ${product.title}`,
                                        slug: slug,
                                        layout_config: [
                                          { id: crypto.randomUUID(), type: "Header", props: { logoText: "Store" } },
                                          { id: crypto.randomUUID(), type: "ProductDetail", props: {} },
                                          { id: crypto.randomUUID(), type: "Footer", props: {} }
                                        ]
                                      }
                                    ]);

                                  if (error) {
                                    alert("Error creating page: " + error.message);
                                    return;
                                  }
                                }
                                router.push(`/editor/${storeId}?slug=${slug}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Edit size={14} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
