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

    const aiConfig: AIModelConfig = modelConfig || { provider: 'gemini', model: 'gemini-3-flash-preview' };

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
      5. CREATE_TODO: Add a task to the store's todo list/planner.
      6. CREATE_CONTENT_PACKET: Create a reusable content item (feature, testimonial, post) in the Content Library.
      7. GENERAL_CHAT: Answer a question or provide advice (e.g. SEO, design tips).
      8. BUILD_PAGE: Generate a complete page layout from scratch. Use for high-level requests like "Build a high-end jewelry homepage", "Create a landing page for my bakery", "Make me a store for selling sneakers".
      9. CREATE_PRODUCTS: Generate product data including names, descriptions, prices, and placeholder images. Use for requests like "Create 5 jewelry products", "Add some sample products for a coffee shop".

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
      - If the user describes a complete store/page vision (e.g. "Build a jewelry store", "Create a coffee shop homepage"), use BUILD_PAGE.
      - If the user wants to generate products (e.g. "Create products", "Add sample inventory"), use CREATE_PRODUCTS.
      - If the user wants to add something to the page (e.g. "add a hero"), use CREATE_COMPONENT.
      - If the user wants to change the selected block (e.g. "make the background blue"), use UPDATE_COMPONENT.
      - If the user wants to change the overall look (e.g. "make it look like cyberpunk"), use SET_THEME.
      - If the user wants to restructure the page (delete, reorder, replace), use UPDATE_LAYOUT.
      - If the user wants to remember to do something (e.g. "remind me to write a blog post", "add task to check inventory"), use CREATE_TODO.
      - If the user wants to save content for later or add to the library (e.g. "create a testimonial from Bob", "save this feature text"), use CREATE_CONTENT_PACKET.
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

      For CREATE_TODO:
      {
        "action": "CREATE_TODO",
        "data": {
          "title": "Short title",
          "description": "Detailed description"
        }
      }

      For CREATE_CONTENT_PACKET:
      {
        "action": "CREATE_CONTENT_PACKET",
        "data": {
          "type": "feature" | "testimonial" | "faq" | "text_block",
          "name": "Internal Name",
          "data": { ...content fields (title, description, author, quote, question, answer)... }
        }
      }

      For GENERAL_CHAT:
      {
        "action": "GENERAL_CHAT",
        "data": {
          "message": "Your helpful response here..."
        }
      }

      For BUILD_PAGE (generate complete page from high-level description):
      {
        "action": "BUILD_PAGE",
        "data": {
          "theme": "elegant" | "playful" | "simple" | "dynamic",
          "colors": { 
            "primary": "#...", 
            "secondary": "#...", 
            "accent": "#...", 
            "background": "#...", 
            "text": "#..." 
          },
          "blocks": [
            { "type": "Header", "props": { "logoText": "Store Name", "links": [...] } },
            { "type": "Hero", "props": { "title": "...", "subtitle": "...", "backgroundImage": "..." } },
            { "type": "ProductGrid", "props": { "title": "Featured Products", "columns": 4 } },
            { "type": "Testimonials", "props": { ... } },
            { "type": "Footer", "props": { ... } }
          ]
        }
      }

      For CREATE_PRODUCTS (generate sample product data):
      {
        "action": "CREATE_PRODUCTS",
        "data": {
          "products": [
            { 
              "title": "Product Name", 
              "description": "Detailed product description...", 
              "price": 4999, 
              "images": ["https://images.unsplash.com/..."],
              "slug": "product-name"
            }
          ]
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
