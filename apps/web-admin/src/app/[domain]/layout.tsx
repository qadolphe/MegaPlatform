import { cookies } from "next/headers";
import { CartDrawer } from "@repo/ui-bricks";
import { supabase } from "@repo/database";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
    const { domain: rawDomain } = await params;
    const host = decodeURIComponent(rawDomain);

    // Helper to parse the domain (duplicated from page.tsx, ideally shared)
    const getSubdomain = (host: string) => {
        if (host.includes("localhost")) {
            const parts = host.split(".");
            if (parts.length === 1 || parts[0] === "localhost") return null;
            return parts[0]; 
        }
        if (host.includes("hoodieplatform.com") || host.includes("swatbloc.com")) {
            return host.split(".")[0];
        }
        return null;
    };

    const subdomain = getSubdomain(host);
    const query = supabase.from("stores").select("name, favicon_url");
    
    if (subdomain) {
        query.eq('subdomain', subdomain);
    } else {
        query.eq('custom_domain', host);
    }

    const { data: store } = await query.single();

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
