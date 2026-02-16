import { z } from "zod";
import { McpTool } from "../common/types.js";
import { getSdkClient } from "./helpers.js";

export const sdkTools: McpTool[] = [
    {
        name: "sdk_products",
        description: "Full Products SDK tool: list, get, create, update, delete, by_category, search, update_pipeline.",
        schema: {
            input: z.object({
                api_key: z.string().optional().describe("SwatBloc API key (pk_... or sk_...). Falls back to SWATBLOC_API_KEY env."),
                base_url: z.string().url().optional().describe("Optional API base URL. Falls back to SWATBLOC_BASE_URL env."),
                action: z.enum(["list", "get", "create", "update", "delete", "by_category", "search", "update_pipeline"]),
                id: z.string().optional(),
                id_or_slug: z.string().optional(),
                data: z.record(z.string(), z.any()).optional(),
                category: z.string().optional(),
                query: z.string().optional(),
                options: z.object({
                    limit: z.number().optional(),
                    offset: z.number().optional(),
                    category: z.string().optional(),
                    search: z.string().optional()
                }).optional(),
                pipeline_steps: z.array(z.object({
                    id: z.string(),
                    label: z.string(),
                    required_metadata: z.array(z.string()).default([])
                })).optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);

            switch (args.action) {
                case "list":
                    return sdk.products.list(args.options || {});
                case "get":
                    if (!args.id_or_slug) throw new Error("id_or_slug is required for get");
                    return sdk.products.get(args.id_or_slug);
                case "create":
                    if (!args.data) throw new Error("data is required for create");
                    return sdk.products.create(args.data);
                case "update":
                    if (!args.id) throw new Error("id is required for update");
                    if (!args.data) throw new Error("data is required for update");
                    return sdk.products.update(args.id, args.data);
                case "delete":
                    if (!args.id) throw new Error("id is required for delete");
                    await sdk.products.delete(args.id);
                    return { message: "Product deleted" };
                case "by_category":
                    if (!args.category) throw new Error("category is required for by_category");
                    return sdk.products.byCategory(args.category, args.options || {});
                case "search":
                    if (!args.query) throw new Error("query is required for search");
                    return sdk.products.search(args.query, args.options || {});
                case "update_pipeline":
                    if (!args.id) throw new Error("id is required for update_pipeline");
                    if (!args.pipeline_steps) throw new Error("pipeline_steps is required for update_pipeline");
                    if (typeof (sdk.products as any).updatePipeline === "function") {
                        return (sdk.products as any).updatePipeline(args.id, args.pipeline_steps);
                    }
                    return sdk.products.update(args.id, { fulfillment_pipeline: args.pipeline_steps } as any);
                default:
                    return { error: true, message: "Invalid action" };
            }
        }
    },
    {
        name: "sdk_variants",
        description: "Full Variants SDK tool: list, get, create, update, delete, generate.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                action: z.enum(["list", "get", "create", "update", "delete", "generate"]),
                product_id: z.string(),
                variant_id: z.string().optional(),
                data: z.record(z.string(), z.any()).optional(),
                replace_existing: z.boolean().optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);

            switch (args.action) {
                case "list":
                    return sdk.variants.list(args.product_id);
                case "get":
                    if (!args.variant_id) throw new Error("variant_id is required for get");
                    return sdk.variants.get(args.product_id, args.variant_id);
                case "create":
                    if (!args.data) throw new Error("data is required for create");
                    return sdk.variants.create(args.product_id, args.data);
                case "update":
                    if (!args.variant_id) throw new Error("variant_id is required for update");
                    if (!args.data) throw new Error("data is required for update");
                    return sdk.variants.update(args.product_id, args.variant_id, args.data);
                case "delete":
                    if (!args.variant_id) throw new Error("variant_id is required for delete");
                    await sdk.variants.delete(args.product_id, args.variant_id);
                    return { message: "Variant deleted" };
                case "generate":
                    return sdk.variants.generateFromOptions(args.product_id, args.replace_existing ?? true);
                default:
                    return { error: true, message: "Invalid action" };
            }
        }
    },
    {
        name: "sdk_cart",
        description: "Full Cart SDK tool: create, get, add_items, update_item, remove_item.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                action: z.enum(["create", "get", "add_items", "update_item", "remove_item"]),
                cart_id: z.string().optional(),
                items: z.array(z.object({
                    productId: z.string(),
                    quantity: z.number(),
                    variantId: z.string().optional(),
                    metadata: z.record(z.string(), z.any()).optional()
                })).optional(),
                product_id: z.string().optional(),
                quantity: z.number().optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);

            switch (args.action) {
                case "create":
                    if (!args.items) throw new Error("items is required for create");
                    return sdk.cart.create(args.items);
                case "get":
                    if (!args.cart_id) throw new Error("cart_id is required for get");
                    return sdk.cart.get(args.cart_id);
                case "add_items":
                    if (!args.cart_id) throw new Error("cart_id is required for add_items");
                    if (!args.items) throw new Error("items is required for add_items");
                    return sdk.cart.addItems(args.cart_id, args.items);
                case "update_item":
                    if (!args.cart_id) throw new Error("cart_id is required for update_item");
                    if (!args.product_id) throw new Error("product_id is required for update_item");
                    if (args.quantity === undefined) throw new Error("quantity is required for update_item");
                    return sdk.cart.updateItem(args.cart_id, args.product_id, args.quantity);
                case "remove_item":
                    if (!args.cart_id) throw new Error("cart_id is required for remove_item");
                    if (!args.product_id) throw new Error("product_id is required for remove_item");
                    return sdk.cart.removeItem(args.cart_id, args.product_id);
                default:
                    return { error: true, message: "Invalid action" };
            }
        }
    },
    {
        name: "sdk_checkout",
        description: "Checkout SDK tool: create checkout session from cart.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                cart_id: z.string(),
                success_url: z.string().url(),
                cancel_url: z.string().url()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);
            return sdk.checkout.create(args.cart_id, {
                successUrl: args.success_url,
                cancelUrl: args.cancel_url
            });
        }
    },
    {
        name: "sdk_store",
        description: "Store SDK tool: fetch store info.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);
            return sdk.store.info();
        }
    },
    {
        name: "sdk_media",
        description: "Media SDK tool: list content library assets.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                search: z.string().optional(),
                limit: z.number().optional(),
                offset: z.number().optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);
            return sdk.media.list({
                search: args.search,
                limit: args.limit,
                offset: args.offset
            });
        }
    },
    {
        name: "sdk_models",
        description: "Custom DB model SDK tool: list_models or create_model.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                action: z.enum(["list_models", "create_model"]),
                name: z.string().optional(),
                slug: z.string().optional(),
                schema: z.object({
                    fields: z.array(z.object({
                        key: z.string(),
                        type: z.enum(["text", "number", "boolean", "image", "date", "json", "reference"]),
                        label: z.string().optional(),
                        required: z.boolean().optional()
                    }))
                }).optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);

            if (args.action === "list_models") {
                return sdk.db.listModels();
            }

            if (!args.name || !args.slug || !args.schema) {
                throw new Error("name, slug, and schema are required for create_model");
            }

            return sdk.db.createModel(args.name, args.slug, args.schema);
        }
    },
    {
        name: "sdk_content",
        description: "Custom DB content SDK tool: list, get, create, update, delete items for a collection slug.",
        schema: {
            input: z.object({
                api_key: z.string().optional(),
                base_url: z.string().url().optional(),
                action: z.enum(["list", "get", "create", "update", "delete"]),
                slug: z.string(),
                id: z.string().optional(),
                data: z.record(z.string(), z.any()).optional(),
                options: z.object({
                    limit: z.number().optional(),
                    offset: z.number().optional(),
                    sort: z.string().optional(),
                    filter: z.record(z.string(), z.any()).optional()
                }).optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);
            const collection = sdk.db.collection(args.slug);

            switch (args.action) {
                case "list":
                    return collection.list(args.options || {});
                case "get":
                    if (!args.id) throw new Error("id is required for get");
                    return collection.get(args.id);
                case "create":
                    if (!args.data) throw new Error("data is required for create");
                    return collection.create(args.data);
                case "update":
                    if (!args.id) throw new Error("id is required for update");
                    if (!args.data) throw new Error("data is required for update");
                    return collection.update(args.id, args.data);
                case "delete":
                    if (!args.id) throw new Error("id is required for delete");
                    await collection.delete(args.id);
                    return { message: "Content item deleted" };
                default:
                    return { error: true, message: "Invalid action" };
            }
        }
    },
    {
        name: "sdk_orders",
        description: "Orders SDK tool: list, get, update, transition_item.",
        schema: {
            input: z.object({
                api_key: z.string().optional().describe("Secret API key recommended for admin operations."),
                base_url: z.string().url().optional(),
                action: z.enum(["list", "get", "update", "transition_item"]),
                id: z.string().optional(),
                options: z.object({
                    limit: z.number().optional(),
                    offset: z.number().optional(),
                    status: z.string().optional(),
                    sessionId: z.string().optional()
                }).optional(),
                updates: z.record(z.string(), z.any()).optional(),
                order_id: z.string().optional(),
                item_id: z.string().optional(),
                transition: z.object({
                    stepId: z.string(),
                    metadata: z.record(z.string(), z.any()).optional(),
                    status: z.enum(["processing", "completed", "cancelled"]).optional()
                }).optional()
            })
        },
        execute: async (args) => {
            const sdk = getSdkClient(args);

            switch (args.action) {
                case "list":
                    return sdk.orders.list(args.options || {});
                case "get":
                    if (!args.id) throw new Error("id is required for get");
                    return sdk.orders.get(args.id);
                case "update":
                    if (!args.id) throw new Error("id is required for update");
                    if (!args.updates) throw new Error("updates is required for update");
                    return sdk.orders.update(args.id, args.updates);
                case "transition_item":
                    if (!args.order_id) throw new Error("order_id is required for transition_item");
                    if (!args.item_id) throw new Error("item_id is required for transition_item");
                    if (!args.transition) throw new Error("transition is required for transition_item");
                    if (typeof (sdk.orders as any).transitionItem === "function") {
                        return (sdk.orders as any).transitionItem(args.order_id, args.item_id, args.transition);
                    }
                    throw new Error("transition_item requires a newer @swatbloc/sdk version that includes orders.transitionItem().");
                default:
                    return { error: true, message: "Invalid action" };
            }
        }
    }
];
