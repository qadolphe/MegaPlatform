"use client";

import Link from "next/link";
import { FileText, Package, Settings, Bot, ShoppingCart, Calendar, Library } from "lucide-react";
import { motion } from "framer-motion";

const ENABLE_SAAS = process.env.NEXT_PUBLIC_ENABLE_SAAS === 'true';

interface PageSwitcherProps {
  storeId: string;
  activeTab: "pages" | "products" | "content" | "orders" | "settings" | "knowledge" | "planner";
}

type TabDef = {
  id: string;
  label: string;
  icon: React.ReactNode;
  saasOnly?: boolean;
};

const allTabs: TabDef[] = [
  { id: "pages", label: "Webstore", icon: <FileText size={16} />, saasOnly: true },
  { id: "products", label: "Products", icon: <Package size={16} /> },
  { id: "content", label: "Content", icon: <Library size={16} />, saasOnly: true },
  { id: "orders", label: "Orders", icon: <ShoppingCart size={16} /> },
  { id: "knowledge", label: "AI Bot", icon: <Bot size={16} />, saasOnly: true },
  { id: "planner", label: "Planner", icon: <Calendar size={16} />, saasOnly: true },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const visibleTabs = allTabs.filter(tab => !tab.saasOnly || ENABLE_SAAS);

export function PageSwitcher({ storeId, activeTab }: PageSwitcherProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg mb-8 w-fit">
      {visibleTabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/store/${storeId}/${tab.id}`}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
            ? "text-slate-900"
            : "text-slate-500 hover:text-slate-900"
            }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
