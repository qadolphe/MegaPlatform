
import { NextResponse } from "next/server";
import { generateEmbedding } from "@repo/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { query, storeId } = await req.json();

        if (!query || !storeId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const embedding = await generateEmbedding(query);
        const supabase = await createClient();

        const { data: results, error } = await supabase.rpc('match_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.5, // Reasonably strict
            match_count: 8,
            filter_store_id: storeId
        });

        if (error) throw error;

        // Filter results to only return products if needed, or return generic items
        // Since we know we are syncing products with metadata.type = 'product', we can format them nicely.

        // We might want to hydrate the product data fully if we want to show price/images in search results.
        // For now, let's return the knowledge items which have title and ID.
        // Ideally, we'd do a second fetch to `products` table if we need price/image.

        // Let's optimize: fetch product details for the matched items.
        const productIds = results
            .filter((r: any) => r.metadata?.type === 'product' && r.metadata?.productId)
            .map((r: any) => r.metadata.productId);

        if (productIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, title, price, images, slug')
                .in('id', productIds)
                .eq('published', true);

            return NextResponse.json({ results: products || [] });
        }

        return NextResponse.json({ results: [] });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}
