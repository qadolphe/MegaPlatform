"use client";

import { PageSwitcher } from "@/components/PageSwitcher";
import { useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
