"use client";

import { supabase } from "@repo/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Store = any; // Using any for MVP speed, ideally import type from database

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("Dashboard: User check", user, authError);
      
      if (!user) {
        console.log("Dashboard: No user found, redirecting to login");
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

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Stores</h1>
          <Link
            href="/new-store"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            + Create New Store
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You haven't created any stores yet.</p>
            <Link
              href="/new-store"
              className="text-blue-600 hover:underline"
            >
              Get started by creating one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {store.subdomain}.hoodieplatform.com
                </p>
                <div className="flex gap-3">
                  <Link
                    href={`/editor/${store.id}`}
                    className="flex-1 bg-gray-100 text-center py-2 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    Open Editor
                  </Link>
                  <a
                    href={`http://${store.subdomain}.localhost:3001`} // Assuming local dev port
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 border border-gray-300 text-center py-2 rounded hover:bg-gray-50 text-sm font-medium"
                  >
                    View Live
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
