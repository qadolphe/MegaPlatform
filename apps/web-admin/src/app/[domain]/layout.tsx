import { cookies } from "next/headers";
import { CartDrawer } from "@repo/ui-bricks";
import { supabase } from "@repo/database";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
    const { domain: rawDomain } = await params;
    const host = decodeURIComponent(rawDomain);

  const { data, error } = await supabase.rpc("get_storefront_store_by_domain", { host });
  const store = error ? null : (data?.[0] ?? null);

    if (store) {
        return {
            title: store.name,
            icons: store.favicon_url ? [{ rel: 'icon', url: store.favicon_url }] : undefined,
        };
    }
    return {
        title: 'Store Not Found',
    };
}

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
