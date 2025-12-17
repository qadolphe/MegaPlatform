"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Settings, LogOut, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Create Store", href: "/new-store", icon: PlusCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const supabase = createClient();

  if (pathname === "/login") return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div 
      className={`fixed left-0 top-0 bottom-0 z-[100] flex flex-col bg-gray-900 text-white transition-all duration-300 ${isHovered ? "w-64 shadow-2xl" : "w-16"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex h-16 items-center ${isHovered ? "px-6" : "justify-center"} font-bold text-xl tracking-wider border-b border-gray-800 overflow-hidden whitespace-nowrap flex-shrink-0`}>
        <Store className={`h-6 w-6 text-blue-500 ${isHovered ? "mr-2" : ""}`} />
        {isHovered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            MEGA<span className="text-blue-500">PLATFORM</span>
          </motion.span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1 p-3 overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isHovered ? item.name : ""}
              className={`relative flex items-center ${isHovered ? "" : "justify-center"} gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-blue-600 rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-800 flex flex-col gap-2">
        <button
          onClick={handleSignOut}
          title={!isHovered ? "Sign Out" : ""}
          className={`flex w-full items-center ${isHovered ? "" : "justify-center"} gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors`}
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {isHovered && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
}
