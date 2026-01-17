"use client";

import { useEffect } from "react";

export function DarkThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Save original background
    const originalBackground = document.body.style.background;
    const originalColor = document.body.style.backgroundColor;

    // Apply dark theme background to body to fix overscroll
    document.body.style.background = "#020617"; // slate-950
    document.body.style.backgroundColor = "#020617";

    return () => {
      // Restore on cleanup (leaving the route)
      document.body.style.background = originalBackground;
      document.body.style.backgroundColor = originalColor;
    };
  }, []);

  return <>{children}</>;
}
