import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
// Note: In a real app, you might want to handle this initialization more robustly
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  console.log("AI Generate Request received");
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { mode } = body;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
    });

    if (mode === "component-edit") {
        const { prompt, currentProps, componentType, availableFields, availableImages } = body;

        const systemPrompt = `
          You are an expert UI/UX designer and developer.
          Your task is to update the properties of a React component based on a user's request.
          
          Component Type: ${componentType}
          
          Available Fields (Schema):
          ${JSON.stringify(availableFields, null, 2)}
          
          Current Properties (JSON):
          ${JSON.stringify(currentProps, null, 2)}

          Available Images (Media Library):
          ${JSON.stringify(availableImages || [], null, 2)}
          
          User Request: "${prompt}"
          
          Instructions:
          1. Analyze the user's request and the current properties.
          2. Return ONLY a valid JSON object containing the updated properties.
          3. Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
          4. Only modify fields that are present in the "Available Fields" list.
          5. If the user asks for something impossible (like changing a field that doesn't exist), try to interpret it as best as possible using existing fields (e.g. "make it pop" -> change colors or animation).
          6. If the user asks for an image or the context implies an image change, PREFER using a URL from "Available Images" if it matches the context. Otherwise, use a high-quality placeholder (e.g. Unsplash).
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        let text = response.text();
        
        // Clean up markdown if present
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const newProps = JSON.parse(text);
            return NextResponse.json({ newProps });
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
        }
    } 
    
    else if (mode === "theme-generation") {
        const { prompt } = body;
        
        const systemPrompt = `
          You are an expert UI designer.
          Your task is to generate a color palette and theme style based on a mood description.
          
          User Request: "${prompt}"
          
          Instructions:
          1. Generate a color palette with 5 colors: primary, secondary, accent, background, text.
          2. Select an animation style from: "simple", "playful", "elegant", "dynamic", "none".
          3. Return ONLY valid JSON.
          
          Response Format:
          {
            "colors": {
              "primary": "#hex",
              "secondary": "#hex",
              "accent": "#hex",
              "background": "#hex",
              "text": "#hex"
            },
            "theme": "style_name"
          }
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
        }
    }

    else if (mode === "chat") {
        // Future implementation for full page chat
        return NextResponse.json({ message: "Chat mode not yet implemented" });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to generate content" }, 
        { status: 500 }
    );
  }
}
