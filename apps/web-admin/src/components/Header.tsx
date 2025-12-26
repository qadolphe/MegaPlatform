"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<{ name: string; logo_url: string | null; subdomain: string } | null>(null);
  const supabase = createClient();
  const params = useParams();
  const storeId = params.storeId as string;
  const [baseDomain, setBaseDomain] = useState("localhost:3000");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseDomain(window.location.host);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    if (storeId) {
      supabase.from("stores").select("name, logo_url, subdomain").eq("id", storeId).single().then(({ data }) => {
        if (data) setStore(data);
      });
    } else {
      setStore(null);
    }
  }, [supabase, storeId]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
      <div className="flex items-center gap-3">
        {store ? (
            <a 
                href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${store.subdomain}` : `//${store.subdomain}.${baseDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                title="View Live Store"
            >
                {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="h-8 w-8 object-contain rounded-md border border-slate-200" />
                ) : (
                    <div className="h-8 w-8 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-sm">
                        {store.name.substring(0, 2).toUpperCase()}
                    </div>
                )}
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {store.name}
                    <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
            </a>
        ) : (
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>
      </div>
    </header>
  );
}
