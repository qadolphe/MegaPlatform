import { supabase } from "@repo/database";
import { Hero, ProductGrid, InfoGrid, Header, Footer } from "@repo/ui-bricks";
import { notFound } from "next/navigation";

// 1. The Registry: Map database strings to real Code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, any> = {
  'Header': Header,
  'Footer': Footer,
  'Hero': Hero,
  'ProductGrid': ProductGrid,
  'BenefitsGrid': InfoGrid,
  'InfoGrid': InfoGrid,
};

// Helper to parse the domain
const getSubdomain = (host: string) => {
  // 1. Localhost Support (e.g. "bob.localhost:3000")
  if (host.includes("localhost")) {
    const parts = host.split(".");
    // If just "localhost:3000", there is no subdomain -> return null
    if (parts.length === 1 || parts[0] === "localhost") return null;
    return parts[0]; 
  }
  
  // 2. Production Support (e.g. "bob.hoodieplatform.com")
  if (host.includes("hoodieplatform.com")) {
    return host.split(".")[0];
  }
  
  // 3. Custom Domain (e.g. "bob-hoodies.com")
  return null; // It's a custom domain, return null to signal "use full host"
};

// Helper to replace missing local images with placeholders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeProps = (props: any): any => {
  if (!props) return props;
  if (typeof props === 'string' && (props.startsWith('/images/') || props.startsWith('/'))) {
    // Check if it looks like an image path
    if (props.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
       // Return a placeholder image from Unsplash
       return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80';
    }
  }
  if (Array.isArray(props)) {
    return props.map(sanitizeProps);
  }
  if (typeof props === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newProps: any = {};
    for (const key in props) {
      newProps[key] = sanitizeProps(props[key]);
    }
    return newProps;
  }
  return props;
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

  const query = supabase.from("stores").select("id, name, theme, store_pages(layout_config, slug, is_home)");
  
  if (subdomain) {
    query.eq('subdomain', subdomain);
  } else {
    query.eq('custom_domain', host);
  }

  const { data: store, error } = await query.single();

  if (error || !store) return notFound();

  // 3. Get the "Home" page layout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = store.store_pages as any[] || [];
  const homePage = pages.find(p => p.is_home) || pages.find(p => p.slug === 'home') || pages[0];
  const layout = homePage?.layout_config || [];

  // 4. Fetch Products if needed
  const productGrids = layout.filter((b: any) => b.type === 'ProductGrid');
  const productsMap: Record<string, any[]> = {};

  for (const block of productGrids) {
      const collectionId = block.props.collectionId || 'all';
      
      // Avoid refetching if we already have this collection
      if (productsMap[collectionId]) continue;

      let fetchedProducts: any[] = [];
      
      if (collectionId === 'all') {
          const { data } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", store.id)
            .eq("published", true)
            .limit(12);
          fetchedProducts = data || [];
      } else {
          const { data } = await supabase
            .from("product_collections")
            .select("products(*)")
            .eq("collection_id", collectionId)
            .limit(12);
          fetchedProducts = data?.map((d: any) => d.products).filter(Boolean) || [];
      }
      
      productsMap[collectionId] = fetchedProducts.map((p: any) => ({
            id: p.id,
            name: p.title, // ProductCard expects 'name'
            description: p.description,
            base_price: p.price, // ProductCard expects 'base_price'
            image_url: p.images?.[0] || p.image_url, // ProductCard expects 'image_url'
            slug: p.slug
      }));
  }

  // 5. The "Engine": Loop through JSON and render components
  return (
    <main>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((block: any, index: number) => {
        const Component = COMPONENT_REGISTRY[block.type];
        if (!Component) return null;
        
        let props = sanitizeProps(block.props);

        // Inject global theme if requested
        if (props.animationStyle === 'theme') {
            props.animationStyle = store.theme;
        }

        // Inject real products into ProductGrid
        if (block.type === 'ProductGrid') {
            const colId = block.props.collectionId || 'all';
            props = { 
                ...props, 
                products: productsMap[colId] || [],
                columns: block.props.columns || 4 
            };
        }

        return <Component key={index} {...props} />;
      })}
    </main>
  );
}
