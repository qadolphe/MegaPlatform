import { NextResponse } from "next/server";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { chat, AIModelConfig } from "@repo/ai";
import { createClient } from "@/lib/supabase/server";
import { ProductGridPropsSchema, HeaderPropsSchema, FooterPropsSchema, HeroPropsSchema, TestimonialsPropsSchema, TextContentPropsSchema, FAQPropsSchema, FeaturesPropsSchema, NewsletterPropsSchema, BannerPropsSchema, InfoGridPropsSchema, CountdownPropsSchema, LogoCloudPropsSchema, ImageBoxPropsSchema, VideoGridPropsSchema } from "@/lib/schemas/component-props";

// Schema map for validation
const COMPONENT_SCHEMA_MAP: Record<string, any> = {
    Header: HeaderPropsSchema,
    Footer: FooterPropsSchema,
    Hero: HeroPropsSchema,
    ProductGrid: ProductGridPropsSchema,
    Testimonials: TestimonialsPropsSchema,
    TextContent: TextContentPropsSchema,
    FAQ: FAQPropsSchema,
    Features: FeaturesPropsSchema,
    Newsletter: NewsletterPropsSchema,
    Banner: BannerPropsSchema,
    InfoGrid: InfoGridPropsSchema,
    BenefitsGrid: InfoGridPropsSchema,
    Countdown: CountdownPropsSchema,
    LogoCloud: LogoCloudPropsSchema,
    ImageBox: ImageBoxPropsSchema,
    VideoGrid: VideoGridPropsSchema,
};

// Default props for components that need them
const COMPONENT_DEFAULTS: Record<string, Record<string, any>> = {
    ProductGrid: {
        sourceType: 'collection',
        columns: 4,
    },
};

// Validate a single block and return errors
function validateBlock(block: { type: string; props: any }): string[] {
    const schema = COMPONENT_SCHEMA_MAP[block.type];
    if (!schema) return []; // Unknown component, skip validation

    const result = schema.safeParse(block.props);
    if (result.success) return [];

    return result.error.issues.map((issue: any) =>
        `${block.type}.${issue.path.join('.')}: ${issue.message}`
    );
}

// Apply defaults and validate layout blocks
function validateAndFixLayout(blocks: any[]): { blocks: any[]; errors: string[] } {
    const allErrors: string[] = [];

    const fixedBlocks = blocks.map(block => {
        // Apply component-specific defaults
        const defaults = COMPONENT_DEFAULTS[block.type] || {};
        const props = { ...defaults, ...block.props };

        const fixedBlock = { ...block, props };

        // Validate
        const errors = validateBlock(fixedBlock);
        allErrors.push(...errors);

        return fixedBlock;
    });

    return { blocks: fixedBlocks, errors: allErrors };
}

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

      IMPORTANT VALIDATION RULES:
      - ProductGrid MUST include: sourceType: "collection" or "manual", columns: number
      - All components should include animationStyle: "theme" for default animations
      - Ensure all props match the component schemas exactly

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
          { "type": "Hero", "props": { "title": "Handcrafted Jewelry", "subtitle": "Unique pieces made with love", "primaryCtaText": "Shop Now", "primaryCtaLink": "/shop" } },
          { "type": "ProductGrid", "props": { "title": "Featured Collection", "sourceType": "collection", "columns": 4 } },
          { "type": "Testimonials", "props": { "title": "What Our Customers Say" } },
          { "type": "Footer", "props": { "storeName": "Artisan Gems" } }
        ]
      }
    `;

        // Generate with validation retry loop
        let storeConfig;
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            attempts++;

            const result = await chat(
                [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
                aiConfig
            );

            let text = result.replace(/```json\n?|```/g, "").trim();

            try {
                storeConfig = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse AI response:", text);
                if (attempts >= maxAttempts) {
                    return NextResponse.json({ error: "AI returned invalid configuration" }, { status: 500 });
                }
                continue;
            }

            // Validate layout blocks
            if (storeConfig.layout && Array.isArray(storeConfig.layout)) {
                const { blocks: fixedBlocks, errors } = validateAndFixLayout(storeConfig.layout);
                storeConfig.layout = fixedBlocks;

                if (errors.length > 0) {
                    console.warn("Layout validation errors (auto-fixed):", errors);
                }
            }

            break; // Success
        }

        if (!storeConfig) {
            return NextResponse.json({ error: "Failed to generate valid store configuration" }, { status: 500 });
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

        // Create homepage with layout (blocks are already validated/fixed)
        const layoutBlocks = storeConfig.layout?.map((b: any) => ({
            id: crypto.randomUUID(),
            type: b.type,
            props: { ...COMPONENT_DEFAULTS[b.type], ...b.props }
        })) || [
                { id: crypto.randomUUID(), type: "Header", props: { logoText: storeConfig.storeName } },
                { id: crypto.randomUUID(), type: "Hero", props: { title: `Welcome to ${storeConfig.storeName}!` } },
                { id: crypto.randomUUID(), type: "ProductGrid", props: { title: "Featured Products", sourceType: "collection", columns: 4 } },
                { id: crypto.randomUUID(), type: "Footer", props: { storeName: storeConfig.storeName } }
            ];

        const headerBlock = layoutBlocks.find((b: any) => b.type === "Header") || {
            id: crypto.randomUUID(),
            type: "Header",
            props: { logoText: storeConfig.storeName }
        };

        const footerBlock = layoutBlocks.find((b: any) => b.type === "Footer") || {
            id: crypto.randomUUID(),
            type: "Footer",
            props: { storeName: storeConfig.storeName }
        };

        const titleFromSlug = (slug: string) =>
            slug
                .split("/")
                .filter(Boolean)
                .pop()!
                .split("-")
                .filter(Boolean)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

        const extractInternalSlugsFromLayout = (blocks: any[]): string[] => {
            const slugs = new Set<string>();

            const addHref = (href: unknown) => {
                if (typeof href !== "string") return;
                if (!href.startsWith("/")) return;
                const cleanPath = href.split("?")[0].split("#")[0];
                if (cleanPath === "/") return;
                const cleanSlug = cleanPath.replace(/^\/+/g, "").replace(/\/+$/g, "");
                if (!cleanSlug) return;
                // Product detail pages are dynamically handled at /products/[slug]
                if (cleanSlug.startsWith("products/")) return;
                slugs.add(cleanSlug);
            };

            const header = blocks.find((b: any) => b.type === "Header");
            const headerLinks = header?.props?.links;
            if (Array.isArray(headerLinks)) {
                for (const link of headerLinks) addHref(link?.href);
            }
            addHref(header?.props?.ctaLink);

            const footer = blocks.find((b: any) => b.type === "Footer");
            const columns = footer?.props?.columns;
            if (Array.isArray(columns)) {
                for (const col of columns) {
                    const links = col?.links;
                    if (!Array.isArray(links)) continue;
                    for (const link of links) addHref(link?.href);
                }
            }

            return Array.from(slugs);
        };

        const cloneBlockWithNewId = (block: any) => ({
            id: crypto.randomUUID(),
            type: block.type,
            props: block.props || {}
        });

        const createPlaceholderPagesForLinks = async () => {
            const internalSlugs = extractInternalSlugsFromLayout(layoutBlocks);
            if (internalSlugs.length === 0) return;

            const pagesToInsert = internalSlugs
                .filter(slug => slug !== "home")
                .map(slug => {
                    const isProductsListing = slug === "products" || slug === "shop";
                    const pageName = titleFromSlug(slug);

                    const pageLayout = isProductsListing
                        ? [
                            cloneBlockWithNewId(headerBlock),
                            {
                                id: crypto.randomUUID(),
                                type: "ProductGrid",
                                props: { title: "All Products", collectionId: "all", columns: 4 }
                            },
                            cloneBlockWithNewId(footerBlock)
                        ]
                        : [
                            cloneBlockWithNewId(headerBlock),
                            {
                                id: crypto.randomUUID(),
                                type: "TextContent",
                                props: {
                                    title: pageName,
                                    subtitle: "",
                                    body: `This is the ${pageName} page. You can edit this content in the editor.`,
                                    alignment: "left",
                                    imagePosition: "right",
                                    animationStyle: "theme"
                                }
                            },
                            cloneBlockWithNewId(footerBlock)
                        ];

                    return {
                        store_id: store.id,
                        slug,
                        name: pageName,
                        layout_config: pageLayout,
                        published: true,
                        is_home: false
                    };
                });

            if (pagesToInsert.length > 0) {
                await supabase.from("store_pages").insert(pagesToInsert);
            }
        };

        await supabase.from("store_pages").insert({
            store_id: store.id,
            slug: "home",
            name: "Home",
            layout_config: layoutBlocks,
            published: true,
            is_home: true
        });

        // Ensure all internal Header/Footer links resolve (no 404s)
        await createPlaceholderPagesForLinks();

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
