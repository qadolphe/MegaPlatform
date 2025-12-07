import { supabase } from "@repo/database";
import { Hero, ProductGrid, InfoGrid, Header, Footer, ProductDetail } from "@repo/ui-bricks";
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
  'ProductDetail': ProductDetail,
};

// Helper to parse the domain
const getSubdomain = (host: string) => {
  if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length === 1 || parts[0] === "localhost") return null;
    return parts[0]; 
  }
  if (host.includes("hoodieplatform.com")) {
    return host.split(".")[0];
  }
  return null;
};

// Helper to replace missing local images with placeholders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeProps = (props: any): any => {
  if (!props) return props;
  if (typeof props === 'string' && (props.startsWith('/images/') || props.startsWith('/'))) {
    if (props.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
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

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string[] }>;
}) {
  const { domain: rawDomain, slug: slugArray } = await params;
  const host = decodeURIComponent(rawDomain);
  const subdomain = getSubdomain(host);
  
  // Construct the slug string (e.g. "about" or "shop/hoodies")
  // My admin currently creates flat slugs like "about-us", so we just join them just in case
  const targetSlug = slugArray.join('/');

  const query = supabase.from("stores").select("id, name, store_pages(layout_config, slug, is_home)");
  
  if (subdomain) {
    query.eq('subdomain', subdomain);
  } else {
    query.eq('custom_domain', host);
  }

  const { data: store, error } = await query.single();

  if (error || !store) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = store.store_pages as any[] || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let layout: any[] = [];

  // 1. Try to find an explicit page record first (DB-backed page)
  const targetPage = pages.find(p => p.slug === targetSlug);

  if (targetPage) {
      layout = targetPage.layout_config || [];
      
      // Hydrate ProductDetail if present (for DB-backed product pages)
      const productDetailBlock = layout.find((b: any) => b.type === 'ProductDetail');
      if (productDetailBlock) {
          // If we are on a product route, fetch that product
          if (slugArray.length === 2 && slugArray[0] === 'products') {
              const productSlug = slugArray[1];
              const { data: product } = await supabase
                .from("products")
                .select("*")
                .eq("store_id", store.id)
                .eq("slug", productSlug)
                .single();
              
              if (product) {
                  // Inject product data into the block props for rendering
                  // We'll handle this injection in the render loop below by checking for 'productData'
                  // But since we map over layout later, let's just mutate/prepare a map or handle it there.
                  // Actually, let's just attach it to the block temporarily or use a separate map.
                  // Simpler: Just fetch it here and use it in the map loop.
              }
          }
      }
  } 
  // 2. If no explicit page, check if it's a Product URL and generate dynamic layout
  else if (slugArray.length === 2 && slugArray[0] === 'products') {
      const productSlug = slugArray[1];
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .eq("slug", productSlug)
        .single();
      
      if (!product) return notFound();

      // Get Header/Footer from Home page (or first available page) to maintain consistency
      const homePage = pages.find(p => p.is_home) || pages[0];
      const homeLayout = homePage?.layout_config || [];
      const headerBlock = homeLayout.find((b: any) => b.type === 'Header') || { type: 'Header', props: { logoText: store.name } };
      const footerBlock = homeLayout.find((b: any) => b.type === 'Footer') || { type: 'Footer', props: {} };

      // Construct Product Page Layout
      layout = [
          headerBlock,
          {
              type: 'ProductDetail',
              props: {
                  product: {
                      id: product.id,
                      name: product.title,
                      description: product.description,
                      base_price: product.price,
                      image_url: product.images?.[0] || product.image_url,
                      slug: product.slug,
                      type: product.type
                  }
              }
          },
          {
              type: 'ProductGrid',
              props: { title: "You might also like", collectionId: 'all', columns: 4 }
          },
          footerBlock
      ];

  } else {
      return notFound();
  }

  // Fetch Products for Grids if needed
  const productGrids = layout.filter((b: any) => b.type === 'ProductGrid');
  const productsMap: Record<string, any[]> = {};
  
  // Fetch Product Data for Detail if needed (and not already populated by dynamic generation)
  // If we loaded from DB, the ProductDetail block might be empty.
  let productDetailData: any = null;
  const hasProductDetail = layout.some((b: any) => b.type === 'ProductDetail');
  
  if (hasProductDetail && !layout.find((b: any) => b.type === 'ProductDetail')?.props?.product) {
       if (slugArray.length === 2 && slugArray[0] === 'products') {
          const productSlug = slugArray[1];
          const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("store_id", store.id)
            .eq("slug", productSlug)
            .single();
          if (product) {
              productDetailData = {
                  id: product.id,
                  name: product.title,
                  description: product.description,
                  base_price: product.price,
                  image_url: product.images?.[0] || product.image_url,
                  slug: product.slug,
                  type: product.type
              };
          }
       }
  }

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

  return (
    <main>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {layout.map((block: any, index: number) => {
        const Component = COMPONENT_REGISTRY[block.type];
        if (!Component) return null;
        
        let props = sanitizeProps(block.props);

        // Inject real products into ProductGrid
        if (block.type === 'ProductGrid') {
            const colId = block.props.collectionId || 'all';
            props = { 
                ...props, 
                products: productsMap[colId] || [],
                columns: block.props.columns || 4 
            };
        }

        // Inject product data into ProductDetail if available from separate fetch
        if (block.type === 'ProductDetail' && productDetailData) {
            props = { ...props, product: productDetailData };
        }

        return <Component key={index} {...props} />;
      })}
    </main>
  );
}
