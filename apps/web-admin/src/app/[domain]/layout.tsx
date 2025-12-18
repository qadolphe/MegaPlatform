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
    </div>
  );
}
