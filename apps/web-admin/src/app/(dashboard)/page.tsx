"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ExternalLink, Edit, Plus, FileText, Package, Trash2, MoreVertical, X, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { HoldToConfirmButton } from "@/components/ui/hold-to-confirm-button";
import { motion, AnimatePresence } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Store = any;

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [baseDomain, setBaseDomain] = useState("localhost:3000");
  const [activeMenuStoreId, setActiveMenuStoreId] = useState<string | null>(null);
  const [deleteModalStoreId, setDeleteModalStoreId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedSupabase = useMemo(() => supabase, []);

  const handleDelete = async (storeId: string) => {
    const { data: { user } } = await memoizedSupabase.auth.getUser();
    console.log("Debug - Deleting Store:", { storeId, userId: user?.id });

    // Verify ownership before attempting delete
    const store = stores.find(s => s.id === storeId);
    if (!store || store.owner_id !== user?.id) {
      console.error("Unauthorized: Only owners can delete stores");
      setDeleteModalStoreId(null);
      return;
    }

    const { error } = await memoizedSupabase
      .from("stores")
      .update({ is_visible: false })
      .eq("id", storeId);

    if (error) {
      console.error("Error deleting store:", JSON.stringify(error, null, 2));
    } else {
      setStores(stores.filter(s => s.id !== storeId));
      setDeleteModalStoreId(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseDomain(window.location.host);
    }

    const checkUser = async () => {
      const { data: { user } } = await memoizedSupabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      
      setCurrentUser(user);

      try {
        const { data: stores, error } = await memoizedSupabase
          .rpc("get_my_stores")
          // get_my_stores already filters for owner/collaborator and is_visible = true
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[Dashboard] Fetch Error:", error);
        } else {
          setStores((stores || []).filter((s: any) => s?.is_visible === true));
        }
      } catch (e) {
        console.error("[Dashboard] Exception fetching stores:", e);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [router, memoizedSupabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <span className="text-sm text-slate-500">Loading stores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">My Stores</h1>
          <p className="text-slate-500">Create and manage your AI-powered storefronts</p>
        </div>
        <Link
          href="/new-store"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" />
          Create Store
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Stores</span>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stores.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active</span>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stores.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">This Month</span>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">$0</p>
          <span className="text-xs text-slate-400">Revenue</span>
        </div>
      </div>

      {stores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-2xl border border-dashed border-slate-300"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Create your first store</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Describe what you want to sell and our AI will generate a complete storefront for you in seconds.
          </p>
          <Link
            href="/new-store"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {stores.map((store, index) => (
              <motion.div
                key={store.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 hover:border-blue-300/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-25" />
                      <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {store.name[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${store.owner_id === currentUser?.id ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                        {store.owner_id === currentUser?.id ? 'Owner' : 'Editor'}
                      </span>
                      {store.owner_id === currentUser?.id && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuStoreId(activeMenuStoreId === store.id ? null : store.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeMenuStoreId === store.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10 py-1 overflow-hidden">
                              <button
                                onClick={() => {
                                  setDeleteModalStoreId(store.id);
                                  setActiveMenuStoreId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={14} /> Delete Store
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{store.name}</h2>
                  <p className="text-slate-500 text-sm">
                    {store.subdomain}.swatbloc.com
                  </p>
                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50 grid grid-cols-2 gap-2">
                  <Link
                    href={`/store/${store.id}/pages`}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Site
                  </Link>
                  <a
                    href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${store.subdomain}` : `//${store.subdomain}.${baseDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 py-2.5 rounded-xl hover:from-blue-100 hover:to-purple-100 text-sm font-medium transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Live
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalStoreId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-96 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Delete Store</h3>
                <button onClick={() => setDeleteModalStoreId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this store? This action cannot be undone and all data will be permanently lost.
              </p>
              <div className="flex flex-col gap-3">
                <HoldToConfirmButton
                  onConfirm={() => handleDelete(deleteModalStoreId)}
                  label="Hold to Delete"
                  confirmLabel="Deleting..."
                  className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 font-medium hover:bg-red-100 transition-colors"
                />
                <button
                  onClick={() => setDeleteModalStoreId(null)}
                  className="w-full py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
