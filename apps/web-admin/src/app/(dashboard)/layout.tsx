"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col pl-16">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
