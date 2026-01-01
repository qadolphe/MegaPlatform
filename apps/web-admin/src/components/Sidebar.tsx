"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Settings, LogOut, Store, Sparkles } from "lucide-react";
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
      className={`fixed left-0 top-0 bottom-0 z-[100] flex flex-col transition-all duration-300 ${isHovered ? "w-64" : "w-16"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: isHovered ? '4px 0 40px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`relative flex h-16 items-center ${isHovered ? "px-5" : "justify-center"} overflow-hidden whitespace-nowrap flex-shrink-0 group`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 text-lg font-bold tracking-wide"
          >
            <span className="text-white">SWAT</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BLOC</span>
          </motion.span>
        )}
      </Link>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1 px-3 mt-4 overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isHovered ? item.name : ""}
              className={`relative flex items-center ${isHovered ? "" : "justify-center"} gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)'
                  }}
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

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          title={!isHovered ? "Sign Out" : ""}
          className={`flex w-full items-center ${isHovered ? "" : "justify-center"} gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200`}
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
