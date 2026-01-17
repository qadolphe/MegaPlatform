import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Store name is required" }, { status: 400 });
        }

        // Generate subdomain from name
        let subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        // removing leading/trailing dashes
        subdomain = subdomain.replace(/^-+|-+$/g, '');
        // Append random string to ensure uniqueness
        subdomain = `${subdomain}-${Math.random().toString(36).substring(2, 7)}`;

        const { data: store, error } = await supabase
            .from("stores")
            .insert({
                name,
                subdomain,
                owner_id: user.id,
                theme: "simple",
                colors: {
                    primary: "#000000",
                    secondary: "#ffffff",
                    accent: "#3b82f6",
                    background: "#ffffff",
                    text: "#000000"
                }
            })
            .select()
            .single();

        if (error) {
            console.error("Store creation error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create a basic homepage
        const headerId = crypto.randomUUID();
        const footerId = crypto.randomUUID();
        const heroId = crypto.randomUUID();
        
        await supabase.from("pages").insert({
            store_id: store.id,
            title: "Home",
            slug: "home",
            is_published: true,
            blocks: [
                {
                    id: headerId,
                    type: "Header",
                    props: { logoText: name }
                },
                {
                    id: heroId,
                    type: "Hero",
                    props: { 
                        title: `Welcome to ${name}`,
                        subtitle: "Your new store is ready to be customized."
                    }
                },
                {
                    id: footerId,
                    type: "Footer",
                    props: { storeName: name }
                }
            ]
        });

        return NextResponse.json({ storeId: store.id, subdomain: store.subdomain });
    } catch (e) {
        console.error("Error:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
