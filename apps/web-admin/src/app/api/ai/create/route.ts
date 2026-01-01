import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    console.log("AI Create Request received");
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing in environment variables");
    }
    
    const { prompt, availableImages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
    });

    // Prepare a summary of available components and their schemas
    const componentsContext = Object.entries(COMPONENT_DEFINITIONS).map(([key, def]) => {
      return {
        type: key,
        description: def.label,
        fields: def.fields.map(f => ({ name: f.name, type: f.type, label: f.label }))
      };
    });

    const systemPrompt = `
      You are an expert UI builder for a website builder platform.
      Your goal is to select the best component from the available list and generate props for it based on the user's request.

      Available Components:
      ${JSON.stringify(componentsContext, null, 2)}

      Available Images (Media Library):
      ${JSON.stringify(availableImages || [], null, 2)}

      User Request: "${prompt}"

      Instructions:
      1. Select the most appropriate component type from the list.
      2. Generate a valid JSON object for its 'props' based on the component's fields.
      3. Be creative with the content (text, images, colors) to match the user's intent.
      4. For images, PREFER using a URL from "Available Images" if it matches the context. Otherwise use placeholder URLs like "https://placehold.co/600x400" or "https://images.unsplash.com/photo-...".
      5. Return ONLY valid JSON. No markdown formatting.

      Response Format:
      {
        "type": "ComponentName",
        "props": { ... }
      }
    `;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?|```/g, "").trim();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("AI Create Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
