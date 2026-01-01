import { NextResponse } from "next/server";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { chat, AIModelConfig } from "@repo/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt } = body;
        // prompt: "I want to sell handmade jewelry"

        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const aiConfig: AIModelConfig = { provider: 'gemini', model: 'gemini-3-flash-preview' };

        // Prepare component list for context
        const componentsList = Object.entries(COMPONENT_DEFINITIONS).map(([key, def]) => ({
            type: key,
            description: def.label,
            fields: def.fields.map(f => ({ name: f.name, type: f.type }))
        }));

        const systemPrompt = `
      You are an expert AI store builder. The user wants to create a new online store.
      Based on their description, generate everything needed to create a complete, beautiful store.

      Available Components for the layout:
      ${JSON.stringify(componentsList)}

      User's Store Vision: "${prompt}"

      Generate a complete store configuration including:
      1. Store name (creative, memorable, relevant to what they're selling)
      2. Subdomain (lowercase, hyphenated, based on the store name)
      3. Theme (elegant, playful, simple, or dynamic - pick what fits best)
      4. Colors (a cohesive color palette that matches the store vibe)
      5. Products (5 sample products with realistic names, descriptions, and prices)
      6. Homepage layout (Header, Hero, ProductGrid, Testimonials, Footer at minimum)

      Response Format (JSON ONLY):
      {
        "storeName": "Artisan Gems",
        "subdomain": "artisan-gems",
        "theme": "elegant",
        "colors": {
          "primary": "#8B5A2B",
          "secondary": "#F5E6D3",
          "accent": "#D4AF37",
          "background": "#FFFEF7",
          "text": "#2C1810"
        },
        "products": [
          {
            "title": "Rose Gold Pendant",
            "description": "Handcrafted rose gold pendant with natural gemstone...",
            "price": 8999,
            "images": ["https://images.unsplash.com/photo-..."],
            "slug": "rose-gold-pendant"
          }
        ],
        "layout": [
          { "type": "Header", "props": { "logoText": "Artisan Gems", "links": [{"label": "Home", "href": "/"}, {"label": "Shop", "href": "/shop"}] } },
          { "type": "Hero", "props": { "title": "Handcrafted Jewelry", "subtitle": "Unique pieces made with love", "buttonText": "Shop Now", "buttonLink": "/shop" } },
          { "type": "ProductGrid", "props": { "title": "Featured Collection", "columns": 4 } },
          { "type": "Testimonials", "props": { "title": "What Our Customers Say" } },
          { "type": "Footer", "props": { "copyright": "© 2026 Artisan Gems" } }
        ]
      }
    `;

        const result = await chat(
            [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            aiConfig
        );

        let text = result.replace(/```json\n?|```/g, "").trim();

        let storeConfig;
        try {
            storeConfig = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI response:", text);
            return NextResponse.json({ error: "AI returned invalid configuration" }, { status: 500 });
        }

        // Create the store
        const { data: store, error: storeError } = await supabase
            .from("stores")
            .insert({
                name: storeConfig.storeName,
                subdomain: storeConfig.subdomain,
                owner_id: user.id,
                theme: storeConfig.theme,
                colors: storeConfig.colors
            })
            .select()
            .single();

        if (storeError) {
            console.error("Store creation error:", storeError);
            return NextResponse.json({ error: storeError.message }, { status: 500 });
        }

        // Create products
        if (storeConfig.products && Array.isArray(storeConfig.products)) {
            const productsToInsert = storeConfig.products.map((p: any) => ({
                store_id: store.id,
                title: p.title,
                description: p.description || "",
                price: p.price || 0,
                images: p.images || [],
                slug: p.slug || p.title.toLowerCase().replace(/\s+/g, '-'),
                published: true
            }));

            await supabase.from("products").insert(productsToInsert);
        }

        // Create homepage with layout
        const layoutBlocks = storeConfig.layout?.map((b: any) => ({
            id: crypto.randomUUID(),
            type: b.type,
            props: b.props || {}
        })) || [
                { id: crypto.randomUUID(), type: "Header", props: { logoText: storeConfig.storeName } },
                { id: crypto.randomUUID(), type: "Hero", props: { title: `Welcome to ${storeConfig.storeName}!` } },
                { id: crypto.randomUUID(), type: "ProductGrid", props: { title: "Featured Products" } },
                { id: crypto.randomUUID(), type: "Footer", props: { copyright: `© ${new Date().getFullYear()} ${storeConfig.storeName}` } }
            ];

        await supabase.from("store_pages").insert({
            store_id: store.id,
            slug: "home",
            name: "Home",
            layout_config: layoutBlocks,
            published: true,
            is_home: true
        });

        return NextResponse.json({
            storeId: store.id,
            storeName: storeConfig.storeName,
            subdomain: storeConfig.subdomain
        });

    } catch (error) {
        console.error("Build Store Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
