"use client";

import Link from "next/link";
import { FileText, Package } from "lucide-react";

interface PageSwitcherProps {
  storeId: string;
  activeTab: "pages" | "products";
}

export function PageSwitcher({ storeId, activeTab }: PageSwitcherProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg mb-8 w-fit">
      <Link
        href={`/store/${storeId}/pages`}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeTab === "pages"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <FileText size={16} />
        Pages
      </Link>
      <Link
        href={`/store/${storeId}/products`}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeTab === "products"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <Package size={16} />
        Products
      </Link>
    </div>
  );
}
