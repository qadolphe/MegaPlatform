import { supabase } from "@repo/database";
import { Hero } from "@repo/ui-bricks";
import { notFound } from "next/navigation";

// 1. The Registry: Map database strings to real Code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, any> = {
  'Hero': Hero,
  // 'ProductGrid': ProductGrid, // Add this later
};

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // 2. Resolve the domain to a Store ID
  // Logic: Check if it's a subdomain (bob.platform.com) or custom domain (bob.com)
  const isSubdomain = domain.includes("hoodieplatform.com"); // Change to your real domain
  
  const query = supabase.from("stores").select("id, name, store_pages(layout_config)");
  
  if (isSubdomain) {
    const subdomain = domain.split('.')[0]; 
    query.eq('subdomain', subdomain);
  } else {
    query.eq('custom_domain', domain);
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
