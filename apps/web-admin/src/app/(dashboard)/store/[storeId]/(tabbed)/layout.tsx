"use client";

import { PageSwitcher } from "@/components/PageSwitcher";
import { useParams, usePathname } from "next/navigation";

export default function StoreTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const storeId = params.storeId as string;

  let activeTab: "pages" | "products" | "orders" | "settings" | "knowledge" | "planner" = "pages";
  if (pathname.includes("/products")) activeTab = "products";
  if (pathname.includes("/orders")) activeTab = "orders";
  if (pathname.includes("/settings")) activeTab = "settings";
  if (pathname.includes("/knowledge")) activeTab = "knowledge";
  if (pathname.includes("/planner")) activeTab = "planner";

  return (
    <div className="flex flex-col h-full">
      <PageSwitcher storeId={storeId} activeTab={activeTab} />
      {/* Content area with padding below tabs */}
      <div className="flex-1 pb-8">
        {children}
      </div>
    </div>
  );
}
