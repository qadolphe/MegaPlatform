import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@repo/ai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    // Verify ownership
    const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
    }

    // 1. Clear existing system-synced knowledge to avoid duplicates
    // We'll assume metadata->>'source' = 'system' identifies these
    await supabase
      .from("knowledge_items")
      .delete()
      .eq("store_id", storeId)
      .eq("metadata->>source", "system");

    const newItems = [];

    // 2. Sync Store Settings
    const storeContent = `Store Settings: Theme is ${store.theme}. Colors are ${JSON.stringify(store.colors)}.`;
    newItems.push({
      store_id: storeId,
      content: storeContent,
      metadata: { source: "system", type: "settings" },
      embedding: await generateEmbedding(storeContent)
    });

    // 3. Sync Products
    const { data: products } = await supabase
      .from("products")
      .select("id, title, description, price, slug")
      .eq("store_id", storeId);

    if (products) {
      for (const p of products) {
        const content = `Product: ${p.title}. Description: ${p.description || "No description"}. Price: $${(p.price / 100).toFixed(2)}. Slug: ${p.slug}`;
        newItems.push({
          store_id: storeId,
          content,
          metadata: { source: "system", type: "product", id: p.id },
          embedding: await generateEmbedding(content)
        });
      }
    }

    // 4. Sync Pages
    const { data: pages } = await supabase
      .from("store_pages")
      .select("id, name, slug, layout_config")
      .eq("store_id", storeId);

    if (pages) {
      for (const p of pages) {
        // Simplify layout config for embedding (just component types)
        const layoutSummary = Array.isArray(p.layout_config) 
          ? p.layout_config.map((c: any) => c.type).join(", ") 
          : "Empty layout";
        
        const content = `Page: ${p.name} (/${p.slug}). Contains sections: ${layoutSummary}.`;
        newItems.push({
          store_id: storeId,
          content,
          metadata: { source: "system", type: "page", id: p.id },
          embedding: await generateEmbedding(content)
        });
      }
    }

    // 5. Insert all new items
    if (newItems.length > 0) {
      const { error } = await supabase.from("knowledge_items").insert(newItems);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: newItems.length });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
