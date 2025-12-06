"use client";

import { supabase } from "@repo/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, Edit, Plus, FileText } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Store = any;

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: stores, error } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id);

      if (error) {
        console.error(error);
      } else {
        setStores(stores || []);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

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
            <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {store.name[0].toUpperCase()}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Active
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{store.name}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {store.subdomain}.hoodieplatform.com
                </p>
              </div>
              <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-lg flex gap-3">
                <Link
                  href={`/store/${store.id}/pages`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Pages
                </Link>
                <a
                  href={`http://${store.subdomain}.localhost:3000`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
