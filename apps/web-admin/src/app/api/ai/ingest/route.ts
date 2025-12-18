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
    const { content, storeId, metadata } = body;

    if (!content || !storeId) {
      return NextResponse.json({ error: "Missing content or storeId" }, { status: 400 });
    }

    // Verify ownership
    const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("id", storeId)
        .eq("owner_id", user.id)
        .single();

    if (!store) {
        return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
    }

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Store in DB
    const { error } = await supabase.from("knowledge_items").insert({
      store_id: storeId,
      content,
      metadata: metadata || {},
      embedding
    });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
