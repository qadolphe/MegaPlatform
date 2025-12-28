import { NextResponse } from "next/server";
import { COMPONENT_DEFINITIONS } from "@/config/component-registry";
import { chat, generateEmbedding, AIModelConfig } from "@repo/ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, context, modelConfig } = body;
    // context: { storeId, selectedBlock, allBlocks, availableImages, storeTheme, storeColors }
    // modelConfig: { provider: 'gemini' | 'openai' | 'anthropic', model: string }

    const aiConfig: AIModelConfig = modelConfig || { provider: 'gemini', model: 'gemini-2.0-flash' };

    // 1. RAG: Retrieve relevant knowledge
    let knowledgeContext = "";
    if (context.storeId) {
        try {
            const supabase = await createClient();
            // Generate embedding for the user prompt
            const embedding = await generateEmbedding(prompt);
            
            // Search for relevant knowledge
            const { data: documents } = await supabase.rpc('match_knowledge', {
                query_embedding: embedding,
                match_threshold: 0.3, // Lower threshold to catch more potential matches
                match_count: 10,      // Increase count to ensure we get all relevant products
                filter_store_id: context.storeId
            });

            if (documents && documents.length > 0) {
                knowledgeContext = `
                Relevant Store Knowledge:
                ${documents.map((d: any) => `- ${d.content}`).join('\n')}
                `;
            }
        } catch (e) {
            console.warn("RAG lookup failed:", e);
        }
    }

    // 2. Prepare Context
    const componentsList = Object.entries(COMPONENT_DEFINITIONS).map(([key, def]) => ({
        type: key,
        description: def.label,
        fields: def.fields.map(f => ({ name: f.name, type: f.type }))
    }));

    const systemPrompt = `
      You are an expert AI assistant for a website builder.
      Your goal is to understand the user's request and decide on the best action to take.
      
      ${knowledgeContext}

      Available Actions:
      1. CREATE_COMPONENT: Add a new section to the page.
      2. UPDATE_COMPONENT: Modify the currently selected component.
      3. SET_THEME: Change the global color palette and animation style.
      4. UPDATE_LAYOUT: Reorder, delete, or replace multiple components. Use this for requests like "delete everything", "remove the text section", "make it just a hero and footer".
      5. GENERAL_CHAT: Answer a question or provide advice (e.g. SEO, design tips).

      Context:
      - Selected Block: ${context.selectedBlock ? JSON.stringify(context.selectedBlock) : "None"}
      - Current Blocks: ${JSON.stringify(context.allBlocks || []).substring(0, 5000)} 
      - Available Components: ${JSON.stringify(componentsList)}
      - Current Theme: ${JSON.stringify(context.storeTheme)}
      - Current Colors: ${JSON.stringify(context.storeColors)}
      - Available Images: ${JSON.stringify(context.availableImages || [])}

      User Request: "${prompt}"

      Instructions:
      - Analyze the request.
      - If the user wants to add something (e.g. "add a hero"), use CREATE_COMPONENT.
      - If the user wants to change the selected block (e.g. "make the background blue"), use UPDATE_COMPONENT.
      - If the user wants to change the overall look (e.g. "make it look like cyberpunk"), use SET_THEME.
      - If the user wants to restructure the page (delete, reorder, replace), use UPDATE_LAYOUT.
      - Otherwise, use GENERAL_CHAT.

      Response Format (JSON ONLY):
      
      For CREATE_COMPONENT:
      {
        "action": "CREATE_COMPONENT",
        "data": {
          "type": "ComponentType",
          "props": { ...generated props... }
        }
      }

      For UPDATE_COMPONENT:
      {
        "action": "UPDATE_COMPONENT",
        "data": {
          "props": { ...only the props to update... }
        }
      }

      For UPDATE_LAYOUT:
      {
        "action": "UPDATE_LAYOUT",
        "data": {
          "blocks": [ 
            { "type": "ComponentType", "props": { ... } } 
            // Return the COMPLETE list of blocks for the page. 
            // If keeping an existing block, try to preserve its props if possible, or regenerate them if needed.
            // IMPORTANT: Always include Header and Footer unless explicitly asked to remove them.
          ]
        }
      }

      For SET_THEME:
      {
        "action": "SET_THEME",
        "data": {
          "theme": "simple" | "playful" | "elegant" | "dynamic" | "none",
          "colors": { "primary": "#...", "secondary": "#...", "accent": "#...", "background": "#...", "text": "#..." }
        }
      }

      For GENERAL_CHAT:
      {
        "action": "GENERAL_CHAT",
        "data": {
          "message": "Your helpful response here..."
        }
      }
    `;

    const result = await chat(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
      aiConfig
    );
    let text = result.replace(/```json\n?|```/g, "").trim();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
