import { supabase } from "@repo/database";
import { notFound } from "next/navigation";
import { extractPacketIds, fetchPackets, hydrateBlockWithPackets } from "../../lib/packet-hydration";
import { LayoutRenderer } from "../../components/layout-renderer";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  // DECODE the domain (Next.js passes it URL-encoded)
  const { domain: rawDomain } = await params;
  const host = decodeURIComponent(rawDomain);
  const { data, error } = await supabase.rpc("get_storefront_store_by_domain", { host });
  const store = error ? null : (data?.[0] ?? null);
  if (error || !store) return notFound();

  const { data: storePages } = await supabase
    .from("store_pages")
    .select("layout_config, slug, is_home")
    .eq("store_id", store.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages = (storePages as any[]) ?? [];

  // Check if we should show the cart (if any product exists or any page has add-to-cart)
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: 'exact', head: true })
    .eq("store_id", store.id)
    .eq("published", true);

  const hasProducts = productCount !== null && productCount > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasStaticAddToCart = (pages as any[]).some(page =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.layout_config?.some((b: any) =>
      b.type === 'ProductDetail' && (b.props?.buttonAction === 'addToCart' || !b.props?.buttonAction)
    )
  );

  const shouldShowCart = hasProducts || hasStaticAddToCart;

  // 3. Get the "Home" page layout
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

    // Default to fetching store products (fallback for specific collections until fully implemented)
    if (fetchedProducts.length === 0) {
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

  // 5. Hydrate Content Packets
  const packetIds = extractPacketIds(layout);
  const packetsMap = await fetchPackets(packetIds);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hydratedLayout = layout.map((block: any) => hydrateBlockWithPackets(block, packetsMap));

  return (
    <>
      <style>{`
        html, body {
          background-color: ${colors.background};
        }
      `}</style>
      <LayoutRenderer
        layout={hydratedLayout}
        colors={colors}
        theme={(store as any).theme}
        productsMap={productsMap}
        showCart={shouldShowCart}
        headerConfig={(store as any).header_config}
        footerConfig={(store as any).footer_config}
      />
    </>
  );
}
