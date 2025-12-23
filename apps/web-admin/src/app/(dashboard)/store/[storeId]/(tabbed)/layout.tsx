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

  let activeTab: "pages" | "products" | "settings" | "knowledge" = "pages";
  if (pathname.includes("/products")) activeTab = "products";
  if (pathname.includes("/settings")) activeTab = "settings";
  if (pathname.includes("/knowledge")) activeTab = "knowledge";

  return (
    <div className="flex flex-col h-full">
      <PageSwitcher storeId={storeId} activeTab={activeTab} />
      {/* The template (and page) will be rendered here */}
      {children} 
    </div>
  );
}
