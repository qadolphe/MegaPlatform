"use client";

import { motion } from "framer-motion";

export default function StoreTabsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      {children}
    </div>
  );
}
