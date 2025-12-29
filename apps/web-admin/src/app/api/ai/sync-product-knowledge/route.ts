
import { NextResponse } from "next/server";
import { generateEmbedding } from "@repo/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const { productId, title, description, tags, storeId } = await req.json();

        if (!productId || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const content = `Product: ${title}\nDescription: ${description || ""}\nTags: ${tags || ""}`;
        const embedding = await generateEmbedding(content);

        const supabase = await createClient();

        // Check if knowledge item already exists for this product
        // We assume metadata->>'productId' holds the reference
        const { data: existing } = await supabase
            .from('knowledge_items')
            .select('id')
            .eq('store_id', storeId)
            .contains('metadata', { productId })
            .single();

        if (existing) {
            await supabase.from('knowledge_items').update({
                content,
                embedding,
                metadata: { productId, type: 'product', title }
            }).eq('id', existing.id);
        } else {
            await supabase.from('knowledge_items').insert({
                store_id: storeId,
                content,
                embedding,
                metadata: { productId, type: 'product', title }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Knowledge sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync knowledge" },
            { status: 500 }
        );
    }
}
