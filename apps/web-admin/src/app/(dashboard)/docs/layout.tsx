"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Package, ShoppingCart, CreditCard, Database, Store, Terminal } from "lucide-react";
import sdkPkg from "../../../../../../packages/sdk/package.json";

const NAV_ITEMS = [
  { label: "Getting Started", href: "/docs", icon: Terminal },
  { label: "Products", href: "/docs/products", icon: Package },
  { label: "Cart", href: "/docs/cart", icon: ShoppingCart },
  { label: "Checkout", href: "/docs/checkout", icon: CreditCard },
  { label: "Database", href: "/docs/db", icon: Database },
  { label: "Store Info", href: "/docs/store", icon: Store },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-8 max-w-6xl mx-auto pb-24">
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-8">
            <div className="mb-6 px-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Book className="h-4 w-4 text-blue-600" />
                    Documentation
                </h2>
                <p className="text-xs text-slate-500 mt-1">SDK Version {sdkPkg.version}</p>
            </div>
            <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive 
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                            }`}
                        >
                            <item.icon size={16} className={isActive ? "text-blue-600" : "text-slate-400"} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[calc(100vh-8rem)]">
            {children}
        </div>
      </div>
    </div>
  );
}
