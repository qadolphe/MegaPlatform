"use client";

import Link from "next/link";
import { FileText, Package, Settings, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface PageSwitcherProps {
  storeId: string;
  activeTab: "pages" | "products" | "settings" | "knowledge";
}

export function PageSwitcher({ storeId, activeTab }: PageSwitcherProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg mb-8 w-fit">
      <Link
        href={`/store/${storeId}/pages`}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "pages"
            ? "text-slate-900"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {activeTab === "pages" && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <FileText size={16} />
            Pages
        </span>
      </Link>
      <Link
        href={`/store/${storeId}/products`}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "products"
            ? "text-slate-900"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {activeTab === "products" && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Package size={16} />
            Products
        </span>
      </Link>
      <Link
        href={`/store/${storeId}/knowledge`}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "knowledge"
            ? "text-slate-900"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {activeTab === "knowledge" && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Bot size={16} />
            AI Bot
        </span>
      </Link>
      <Link
        href={`/store/${storeId}/settings`}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "settings"
            ? "text-slate-900"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {activeTab === "settings" && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Settings size={16} />
            Settings
        </span>
      </Link>
    </div>
  );
}
