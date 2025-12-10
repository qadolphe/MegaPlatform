import { cookies } from "next/headers";
import { X } from "lucide-react";
import { CartDrawer } from "@repo/ui-bricks";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isPreview = cookieStore.has("x-preview-store");

  return (
    <div>
      {children}
      <CartDrawer />
      
      {isPreview && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-700 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Preview Mode</span>
            <span className="text-sm font-semibold">Viewing Storefront</span>
          </div>
          <div className="h-8 w-px bg-gray-700 mx-2" />
          <a 
            href="/?exit_preview=true" 
            className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"
          >
            Exit Preview
          </a>
        </div>
      )}
    </div>
  );
}
