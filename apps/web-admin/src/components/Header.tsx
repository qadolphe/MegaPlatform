"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Bell, Search, Settings, LogOut, User as UserIcon } from "lucide-react";
import { ProfileSettingsDialog } from "./profile-settings-dialog";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<{ name: string; logo_url: string | null; subdomain: string } | null>(null);
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [baseDomain, setBaseDomain] = useState("localhost:3000");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProfileName = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('first_name, last_name').eq('id', userId).limit(1);
    if (data && data.length > 0) {
        const profile = data[0];
        setProfileName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseDomain(window.location.host);
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchProfileName(data.user.id);
    });

    if (storeId) {
      supabase.from("stores").select("name, logo_url, subdomain").eq("id", storeId).single().then(({ data }) => {
        if (data) setStore(data);
      });
    } else {
      setStore(null);
    }
  }, [supabase, storeId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between px-8 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {store ? (
          <a
            href={baseDomain.includes("cloudfront.net") ? `/?preview_store=${store.subdomain}` : `//${store.subdomain}.${baseDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            title="View Live Store"
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-9 w-9 object-contain rounded-xl border border-slate-200 shadow-sm" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                {store.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                {store.name}
                <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs text-slate-500">{store.subdomain}.swatbloc.com</p>
            </div>
          </a>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
            <p className="text-xs text-slate-500">Manage your stores</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-500 transition-colors">
          <Search size={16} />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded-md text-xs text-slate-400 border border-slate-200 shadow-sm">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:bg-slate-50/50 rounded-xl transition-colors p-1"
            >
                <div className="relative">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    {profileName ? profileName[0].toUpperCase() : (user?.email?.[0].toUpperCase() || "U")}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                    {profileName || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-slate-500">Pro Plan</p>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-medium text-slate-900 truncate">{profileName || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                        <button 
                            onClick={() => { setIsDropdownOpen(false); setIsProfileOpen(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Settings size={16} /> Profile Settings
                        </button>
                        <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>

        {user && (
            <ProfileSettingsDialog 
                user={user} 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)}
                onProfileUpdate={() => fetchProfileName(user.id)}
            />
        )}
      </div>
    </header>
  );
}
