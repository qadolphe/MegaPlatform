
import { NextResponse } from "next/server";
import { chat } from "@repo/ai";

export async function POST(req: Request) {
    try {
        const { name, price, tags, existingDescription } = await req.json();

        const systemPrompt = `
      You are an expert e-commerce copywriter.
      Your goal is to write a compelling, SEO-friendly product description.
      
      Product Name: ${name}
      Price: ${price}
      Tags: ${tags || "None"}
      
      Instructions:
      - Write a description that highlights the benefits of the product.
      - Keep it engaging and persuasive.
      - Use a professional but friendly tone.
      - If existing description is provided, enhance it.
      - Return ONLY the description text, no preamble.
      - Keep it under 200 words.
    `;

        const userPrompt = existingDescription
            ? `Rewrite and improve this description: ${existingDescription}`
            : `Write a description for this product.`;

        const description = await chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]);

        return NextResponse.json({ description });

    } catch (error) {
        console.error("Description generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate description" },
            { status: 500 }
        );
    }
}
