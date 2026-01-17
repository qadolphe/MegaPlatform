import { McpTool } from "../common/types.js";
import { z } from "zod";
import { supabase } from "@repo/database";

export const tools: McpTool[] = [
    {
        name: "create_database",
        description: "Create a new custom database (content model) for the store. Use this to store structured data like reviews, preferences, logs, etc. This essentially upgrades the platform.",
        schema: {
            input: z.object({
                store_id: z.string().describe("The ID of the store to create the database for."),
                name: z.string().describe("Human readable name, e.g. 'Liability Photos'"),
                slug: z.string().describe("URL friendly identifier, e.g. 'liability-photos'"),
                fields: z.array(z.object({
                    key: z.string(),
                    type: z.enum(['text', 'number', 'boolean', 'image', 'date', 'json', 'reference']),
                    label: z.string().optional(),
                    required: z.boolean().optional()
                })).describe("The schema definition for the database.")
            })
        },
        execute: async (args) => {
            const { store_id, name, slug, fields } = args;
            
            // Check if exists (Idempotency)
            const { data: existing } = await supabase
                .from('content_models')
                .select('*')
                .eq('store_id', store_id)
                .eq('slug', slug)
                .single();
                
            if (existing) {
                return { 
                    message: "Database already exists", 
                    model: existing 
                };
            }
            
            // Rate Limit / Safety Check: Max 50 tables per store
            const { count } = await supabase
                .from('content_models')
                .select('*', { count: 'exact', head: true })
                .eq('store_id', store_id);
                
            if (count && count >= 50) {
                return {
                    message: "Error: Maximum number of databases (50) reached for this store. Please delete some before creating more.",
                    error: true
                };
            }
            
            const { data: newModel, error } = await supabase
                .from('content_models')
                .insert({
                    store_id,
                    name,
                    slug,
                    schema: { fields }
                })
                .select()
                .single();
                
            if (error) throw new Error(error.message);
            
            return {
                message: "Database created successfully",
                model: newModel
            };
        }
    }
];
