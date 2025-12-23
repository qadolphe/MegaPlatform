"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, Edit, Plus, FileText, Package, Trash2, MoreVertical, X } from "lucide-react";
import { HoldToConfirmButton } from "@/components/ui/hold-to-confirm-button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Store = any;

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseDomain, setBaseDomain] = useState("localhost:3000");
  const [activeMenuStoreId, setActiveMenuStoreId] = useState<string | null>(null);
  const [deleteModalStoreId, setDeleteModalStoreId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (storeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Debug - Deleting Store:", { storeId, userId: user?.id });

    const { error } = await supabase
      .from("stores")
      .update({ is_visible: false })
      .eq("id", storeId);
      
    if (error) {
        console.error("Error deleting store:", JSON.stringify(error, null, 2));
        // Use a toast or custom notification in real app, for now just log
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: stores, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .eq("is_visible", true);

      if (error) {
        console.error(error);
      } else {
        setStores(stores || []);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Stores</h1>
          <p className="text-gray-500">Manage your storefronts and configurations.</p>
        </div>
        <Link
          href="/new-store"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Store
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Plus className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No stores created</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first storefront.</p>
          <Link
            href="/new-store"
            className="text-blue-600 hover:underline font-medium"
          >
            Create a store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col relative">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {store.name[0].toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                    </span>
                    <div className="relative">
                        <button 
                            onClick={() => setActiveMenuStoreId(activeMenuStoreId === store.id ? null : store.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {activeMenuStoreId === store.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                                <button 
                                    onClick={() => {
                                        setDeleteModalStoreId(store.id);
                                        setActiveMenuStoreId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete Store
                                </button>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{store.name}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {store.subdomain}.hoodieplatform.com
                </p>
              </div>
              <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg grid grid-cols-2 gap-2">
                <Link
                  href={`/store/${store.id}/pages`}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Edit Site
                </Link>
                {/* <Link
                  href={`/store/${store.id}/products`}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Products
                </Link> */}
                <a
                  href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${store.subdomain}` : `//${store.subdomain}.${baseDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 py-2 rounded-md hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Storefront
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalStoreId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Delete Store</h3>
                    <button onClick={() => setDeleteModalStoreId(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this store? This action cannot be undone and all data will be permanently lost.
                </p>
                <div className="flex flex-col gap-3">
                    <HoldToConfirmButton 
                        onConfirm={() => handleDelete(deleteModalStoreId)}
                        label="Hold to Delete"
                        confirmLabel="Deleting..."
                        className="w-full bg-red-50 text-red-600 border border-red-200 rounded-md py-3 font-medium hover:bg-red-100 transition-colors"
                    />
                    <button 
                        onClick={() => setDeleteModalStoreId(null)}
                        className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
