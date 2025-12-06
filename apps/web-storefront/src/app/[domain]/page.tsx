import { supabase } from "@repo/database";
import { Hero, ProductGrid } from "@repo/ui-bricks";
import { notFound } from "next/navigation";

// 1. The Registry: Map database strings to real Code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, any> = {
  'Hero': Hero,
  'ProductGrid': ProductGrid,
};

// Helper to parse the domain
const getSubdomain = (host: string) => {
  // 1. Localhost Support (e.g. "bob.localhost:3000")
  if (host.includes("localhost")) {
    const parts = host.split(".");
    // if parts = ["bob", "localhost:3000"], subdomain is "bob"
    return parts.length > 1 ? parts[0] : null; 
  }
  
  // 2. Production Support (e.g. "bob.hoodieplatform.com")
  if (host.includes("hoodieplatform.com")) {
    return host.split(".")[0];
  }
  
  // 3. Custom Domain (e.g. "bob-hoodies.com")
  return null; // It's a custom domain, return null to signal "use full host"
};

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  // DECODE the domain (Next.js passes it URL-encoded)
  const { domain: rawDomain } = await params;
  const host = decodeURIComponent(rawDomain);
  const subdomain = getSubdomain(host);

  const query = supabase.from("stores").select("id, name, store_pages(layout_config)");
  
  if (subdomain) {
    query.eq('subdomain', subdomain);
  } else {
    query.eq('custom_domain', host);
  }

  const { data: store, error } = await query.single();

  if (error || !store) return notFound();

  // 3. Get the "Home" page layout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const homePage = store.store_pages?.[0] as any; // Simplified for MVP
  const layout = homePage?.layout_config || [];

  // 4. The "Engine": Loop through JSON and render components
  return (
    <main>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((block: any, index: number) => {
        const Component = COMPONENT_REGISTRY[block.type];
        if (!Component) return null;
        return <Component key={index} {...block.props} />;
      })}
    </main>
  );
}
