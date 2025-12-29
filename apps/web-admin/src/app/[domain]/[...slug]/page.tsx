import { supabase } from "@repo/database";
import { notFound } from "next/navigation";
import { extractPacketIds, fetchPackets, hydrateBlockWithPackets } from "@/lib/packet-hydration";
import { LayoutRenderer } from "@/components/layout-renderer";

// Helper to parse the domain
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = store.store_pages as any[] || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let layout: any[] = [];

  // 1. Try to find an explicit page record first (DB-backed page)
  const targetPage = pages.find(p => p.slug === targetSlug);

  // We fetch if there is a ProductDetail block AND it doesn't have a valid product prop.
  // This logic was previously mixed in the component body, let's extract the productDetailData here.
  let productDetailData: any = null;

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
          // Populate the data to be passed to Renderer
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
        // We set empty product here, but pass productDetailData to renderer
        props: {}
      },
      {
        type: 'ProductGrid',
        props: { title: "You might also like", collectionId: 'all', columns: 4 }
      },
      footerBlock
    ];

    productDetailData = {
      id: product.id,
      name: product.title,
      description: product.description,
      base_price: product.price,
      image_url: product.images?.[0] || product.image_url,
      slug: product.slug,
      type: product.type
    };

  } else {
    return notFound();
  }

  // Hydrate content packets
  const packetIds = extractPacketIds(layout);
  const packetsMap = await fetchPackets(packetIds);

  // Fetch Products for Grids if needed
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hydratedLayout = layout.map((block: any) => hydrateBlockWithPackets(block, packetsMap));

  return (
    <LayoutRenderer
      layout={hydratedLayout}
      colors={(store as any).colors}
      theme={(store as any).theme}
      productsMap={productsMap}
      productDetailData={productDetailData}
      showCart={shouldShowCart}
    />
  );
}
