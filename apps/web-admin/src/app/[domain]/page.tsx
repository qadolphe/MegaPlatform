import { supabase } from "@repo/database";
import { Hero, ProductGrid, InfoGrid, Header, Footer, TextContent, VideoGrid, ImageBox, Testimonials, FAQ, Banner, LogoCloud, Countdown, Features, Newsletter } from "@repo/ui-bricks";
import { notFound } from "next/navigation";
import { COMPONENT_DEFINITIONS } from "../../config/component-registry";

// 1. The Registry: Map database strings to real Code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_REGISTRY: Record<string, any> = {
  'Header': Header,
  'Footer': Footer,
  'Hero': Hero,
  'ProductGrid': ProductGrid,
  'BenefitsGrid': InfoGrid,
  'InfoGrid': InfoGrid,
  'TextContent': TextContent,
  'VideoGrid': VideoGrid,
  'ImageBox': ImageBox,
  'Testimonials': Testimonials,
  'FAQ': FAQ,
  'Banner': Banner,
  'LogoCloud': LogoCloud,
  'Countdown': Countdown,
  'Features': Features,
  'Newsletter': Newsletter,
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
  
  // 2. Production Support (e.g. "bob.hoodieplatform.com" or "bob.swatbloc.com")
  if (host.includes("hoodieplatform.com") || host.includes("swatbloc.com")) {
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

  const query = supabase.from("stores").select("id, name, theme, colors, store_pages(layout_config, slug, is_home)");
  
  if (subdomain) {
    query.eq('subdomain', subdomain);
  } else {
    query.eq('custom_domain', host);
  }

  const { data: store, error } = await query.single();

  if (error || !store) return notFound();

  // Check if we should show the cart (if any product exists or any page has add-to-cart)
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: 'exact', head: true })
    .eq("store_id", store.id)
    .eq("published", true);

  const hasProducts = productCount !== null && productCount > 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasStaticAddToCart = (store.store_pages as any[]).some(page => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.layout_config?.some((b: any) => 
      b.type === 'ProductDetail' && (b.props?.buttonAction === 'addToCart' || !b.props?.buttonAction)
    )
  );

  const shouldShowCart = hasProducts || hasStaticAddToCart;

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
          .limit(8);
        fetchedProducts = data || [];
      }
      // TODO: Add collection support
      
      // Map to ProductCard format
      productsMap[collectionId] = fetchedProducts.map((p: any) => ({
            id: p.id,
            name: p.title, // ProductCard expects 'name'
            description: p.description,
            base_price: p.price, // ProductCard expects 'base_price'
            image_url: p.images?.[0] || p.image_url, // ProductCard expects 'image_url'
            slug: p.slug,
            metafields: p.metafields || [] // Pass through metafields for display
      }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const colors = (store as any).colors || {
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#000000"
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        '--color-primary': colors.primary,
        '--color-secondary': colors.secondary,
        '--color-accent': colors.accent,
        '--color-background': colors.background,
        '--color-text': colors.text,
        backgroundColor: colors.background,
        color: colors.text
      } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((block: any, i: number) => {
        const Component = COMPONENT_REGISTRY[block.type];
        if (!Component) return null;

        // Merge defaults to ensure new features propagate to existing sites
        const def = COMPONENT_DEFINITIONS[block.type as keyof typeof COMPONENT_DEFINITIONS];
        const defaultProps = def ? def.defaultProps : {};
        let props = { ...defaultProps, ...block.props };
        
        // Inject products if this is a ProductGrid
        if (block.type === 'ProductGrid') {
            const collectionId = props.collectionId || 'all';
            props.products = productsMap[collectionId] || [];
        }

        // Inject showCart if this is a Header
        if (block.type === 'Header') {
            props.showCart = shouldShowCart;
        }

        // Inject Global Theme if requested
        if (props.animationStyle === 'theme') {
            props.animationStyle = (store as any).theme || 'simple';
        }

        // Sanitize props (fix images)
        props = sanitizeProps(props);

        return <Component key={block.id || i} {...props} />;
      })}
    </div>
  );
}
