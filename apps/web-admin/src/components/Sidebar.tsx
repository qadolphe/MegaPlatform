"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Settings, LogOut, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Store", href: "/new-store", icon: PlusCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className={`flex h-full flex-col bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className={`flex h-16 items-center ${isCollapsed ? "justify-center" : "px-6"} font-bold text-xl tracking-wider border-b border-gray-800 overflow-hidden whitespace-nowrap`}>
        <Store className={`h-6 w-6 text-blue-500 ${isCollapsed ? "" : "mr-2"}`} />
        {!isCollapsed && (
          <>MEGA<span className="text-blue-500">PLATFORM</span></>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ""}
              className={`flex items-center ${isCollapsed ? "justify-center" : ""} gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 min-w-[20px]" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-800 flex flex-col gap-2">
        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Sign Out" : ""}
          className={`flex w-full items-center ${isCollapsed ? "justify-center" : ""} gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors`}
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-md py-2 text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
        >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </div>
  );
}
