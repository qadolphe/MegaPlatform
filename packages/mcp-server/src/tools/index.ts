import { McpTool } from "../common/types.js";
import { z } from "zod";
import { supabase } from "@repo/database";

/**
 * Generate Cartesian product from options
 */
function generateCartesianProduct(options: Array<{ name: string; values: string[] }>): Record<string, string>[] {
    if (options.length === 0) return [{}];
    const result: Record<string, string>[] = [];
    function recurse(index: number, current: Record<string, string>) {
        if (index === options.length) {
            result.push({ ...current });
            return;
        }
        const option = options[index];
        for (const value of option.values) {
            current[option.name] = value;
            recurse(index + 1, current);
        }
    }
    recurse(0, {});
    return result;
}

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
    },

    // ==================== PRODUCT TOOLS ====================

    {
        name: "list_products",
        description: "List all products for a store. Returns product titles, prices, and IDs.",
        schema: {
            input: z.object({
                store_id: z.string().describe("The ID of the store to list products for."),
                limit: z.number().optional().describe("Maximum number of products to return (default: 50)"),
                published_only: z.boolean().optional().describe("Only return published products (default: false)")
            })
        },
        execute: async (args) => {
            const { store_id, limit = 50, published_only = false } = args;

            let query = supabase
                .from('products')
                .select('id, title, slug, price, published, options')
                .eq('store_id', store_id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (published_only) {
                query = query.eq('published', true);
            }

            const { data: products, error } = await query;

            if (error) throw new Error(error.message);

            return {
                message: `Found ${products?.length || 0} products`,
                products: products || []
            };
        }
    },

    {
        name: "manage_product",
        description: "Create, update, or delete a product. For creating products with variants, first create the product with options, then use manage_variant with action 'generate' to auto-create variants.",
        schema: {
            input: z.object({
                store_id: z.string().describe("The ID of the store."),
                action: z.enum(['create', 'update', 'delete']).describe("The action to perform."),
                product_id: z.string().optional().describe("Required for update/delete actions."),
                data: z.object({
                    title: z.string().optional().describe("Product title"),
                    description: z.string().optional().describe("Product description"),
                    price: z.number().optional().describe("Product price in cents (e.g., 1999 = $19.99)"),
                    compare_at_price: z.number().optional().describe("Compare at price in cents"),
                    options: z.array(z.object({
                        name: z.string().describe("Option name, e.g., 'Size' or 'Color'"),
                        values: z.array(z.string()).describe("Option values, e.g., ['S', 'M', 'L']")
                    })).optional().describe("Product options for variant generation"),
                    published: z.boolean().optional().describe("Whether the product is published"),
                    category: z.string().optional().describe("Product category"),
                    sku: z.string().optional().describe("Product SKU"),
                    images: z.array(z.string()).optional().describe("Array of image URLs")
                }).optional().describe("Product data for create/update")
            })
        },
        execute: async (args) => {
            const { store_id, action, product_id, data } = args;

            if (action === 'create') {
                if (!data?.title) {
                    return { error: true, message: "Title is required to create a product" };
                }

                const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);

                const productData = {
                    store_id,
                    title: data.title,
                    slug,
                    description: data.description || '',
                    price: data.price || 0,
                    compare_at_price: data.compare_at_price || null,
                    options: data.options || [],
                    published: data.published ?? false,
                    category: data.category || null,
                    sku: data.sku || null,
                    images: data.images || []
                };

                const { data: product, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                    .single();

                if (error) throw new Error(error.message);

                return {
                    message: "Product created successfully",
                    product
                };
            }

            if (action === 'update') {
                if (!product_id) {
                    return { error: true, message: "product_id is required for update" };
                }

                const updateData: any = {};
                if (data?.title) updateData.title = data.title;
                if (data?.description !== undefined) updateData.description = data.description;
                if (data?.price !== undefined) updateData.price = data.price;
                if (data?.compare_at_price !== undefined) updateData.compare_at_price = data.compare_at_price;
                if (data?.options) updateData.options = data.options;
                if (data?.published !== undefined) updateData.published = data.published;
                if (data?.category !== undefined) updateData.category = data.category;
                if (data?.sku !== undefined) updateData.sku = data.sku;
                if (data?.images) updateData.images = data.images;

                const { data: product, error } = await supabase
                    .from('products')
                    .update(updateData)
                    .eq('id', product_id)
                    .eq('store_id', store_id)
                    .select()
                    .single();

                if (error) throw new Error(error.message);

                return {
                    message: "Product updated successfully",
                    product
                };
            }

            if (action === 'delete') {
                if (!product_id) {
                    return { error: true, message: "product_id is required for delete" };
                }

                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', product_id)
                    .eq('store_id', store_id);

                if (error) throw new Error(error.message);

                return {
                    message: "Product deleted successfully"
                };
            }

            return { error: true, message: "Invalid action" };
        }
    },

    {
        name: "manage_variant",
        description: "Create, update, delete, or auto-generate variants for a product. Use 'generate' action to automatically create variants from product options (Cartesian product).",
        schema: {
            input: z.object({
                product_id: z.string().describe("The ID of the product."),
                action: z.enum(['create', 'update', 'delete', 'generate', 'list']).describe("The action to perform."),
                variant_id: z.string().optional().describe("Required for update/delete actions."),
                data: z.object({
                    title: z.string().optional().describe("Variant title (e.g., 'S / Red')"),
                    sku: z.string().optional().describe("Variant SKU"),
                    price: z.number().optional().describe("Variant price in cents"),
                    inventory_quantity: z.number().optional().describe("Inventory count"),
                    options: z.record(z.string(), z.string()).optional().describe("Option values, e.g., { 'Size': 'S', 'Color': 'Red' }")
                }).optional().describe("Variant data for create/update"),
                replace_existing: z.boolean().optional().describe("For 'generate': replace existing variants (default: true)")
            })
        },
        execute: async (args) => {
            const { product_id, action, variant_id, data, replace_existing = true } = args;

            // Verify product exists
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('id, price, options')
                .eq('id', product_id)
                .single();

            if (productError || !product) {
                return { error: true, message: "Product not found" };
            }

            if (action === 'list') {
                const { data: variants, error } = await supabase
                    .from('product_variants')
                    .select('id, title, sku, price, inventory_quantity, options')
                    .eq('product_id', product_id)
                    .order('title');

                if (error) throw new Error(error.message);

                return {
                    message: `Found ${variants?.length || 0} variants`,
                    variants: variants || []
                };
            }

            if (action === 'generate') {
                const options = product.options || [];

                if (!options.length || !options.every((o: any) => o.values?.length > 0)) {
                    return {
                        error: true,
                        message: "Product must have at least one option with values defined. Update the product options first."
                    };
                }

                const combinations = generateCartesianProduct(options);

                if (combinations.length > 100) {
                    return {
                        error: true,
                        message: `Too many variants (${combinations.length}). Maximum is 100. Reduce option values.`
                    };
                }

                if (replace_existing) {
                    await supabase
                        .from('product_variants')
                        .delete()
                        .eq('product_id', product_id);
                }

                const variantsToInsert = combinations.map(combo => ({
                    product_id,
                    title: Object.values(combo).join(' / '),
                    sku: null,
                    price: product.price,
                    inventory_quantity: 0,
                    options: combo,
                    description: null,
                    image_url: null,
                    images: []
                }));

                const { data: variants, error } = await supabase
                    .from('product_variants')
                    .insert(variantsToInsert)
                    .select();

                if (error) throw new Error(error.message);

                return {
                    message: `Generated ${variants?.length || 0} variants from options`,
                    variants: variants || []
                };
            }

            if (action === 'create') {
                const variantData = {
                    product_id,
                    title: data?.title || 'New Variant',
                    sku: data?.sku || null,
                    price: data?.price ?? product.price,
                    inventory_quantity: data?.inventory_quantity || 0,
                    options: data?.options || {},
                    description: null,
                    image_url: null,
                    images: []
                };

                const { data: variant, error } = await supabase
                    .from('product_variants')
                    .insert(variantData)
                    .select()
                    .single();

                if (error) throw new Error(error.message);

                return {
                    message: "Variant created successfully",
                    variant
                };
            }

            if (action === 'update') {
                if (!variant_id) {
                    return { error: true, message: "variant_id is required for update" };
                }

                const updateData: any = {};
                if (data?.title) updateData.title = data.title;
                if (data?.sku !== undefined) updateData.sku = data.sku;
                if (data?.price !== undefined) updateData.price = data.price;
                if (data?.inventory_quantity !== undefined) updateData.inventory_quantity = data.inventory_quantity;
                if (data?.options) updateData.options = data.options;

                const { data: variant, error } = await supabase
                    .from('product_variants')
                    .update(updateData)
                    .eq('id', variant_id)
                    .eq('product_id', product_id)
                    .select()
                    .single();

                if (error) throw new Error(error.message);

                return {
                    message: "Variant updated successfully",
                    variant
                };
            }

            if (action === 'delete') {
                if (!variant_id) {
                    return { error: true, message: "variant_id is required for delete" };
                }

                const { error } = await supabase
                    .from('product_variants')
                    .delete()
                    .eq('id', variant_id)
                    .eq('product_id', product_id);

                if (error) throw new Error(error.message);

                return {
                    message: "Variant deleted successfully"
                };
            }

            return { error: true, message: "Invalid action" };
        }
    }
];
