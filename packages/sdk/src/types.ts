/**
 * SwatBloc SDK Types
 */

/**
 * Product option (e.g., Size, Color)
 * Defines the customization options available for a product
 */
export interface ProductOption {
    name: string;           // e.g., "Size", "Color"
    values: string[];       // e.g., ["S", "M", "L"] or ["Red", "Blue", "Green"]
    position?: number;      // Display order (1-indexed)
}

/**
 * Product variant - a specific combination of option values
 * Each variant can have its own price, inventory, SKU, etc.
 */
export interface ProductVariant {
    id: string;
    product_id: string;
    title: string;          // e.g., "S / Red" - auto-generated from option values
    sku: string | null;
    barcode?: string | null;
    price: number;          // Price in cents
    compare_at_price?: number | null;
    inventory_quantity: number;
    options: Record<string, string>;  // e.g., { "Size": "S", "Color": "Red" }
    image_url: string | null;
    images: string[];
    description?: string | null;
    weight?: number | null;
    weight_unit?: string;
    requires_shipping?: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Input data for creating/updating a variant
 */
export interface VariantInput {
    title?: string;
    sku?: string | null;
    barcode?: string | null;
    price?: number;
    compare_at_price?: number | null;
    inventory_quantity?: number;
    options?: Record<string, string>;
    image_url?: string | null;
    images?: string[];
    description?: string | null;
    weight?: number | null;
    weight_unit?: string;
}

export interface Product {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[];
    image_key?: string | null;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    inventory_quantity: number;
    weight: number | null;
    weight_unit: string;
    published: boolean;
    options: ProductOption[];
    variants?: ProductVariant[];
    metafields: any[];
    /** Fulfillment pipeline definition for service commerce */
    fulfillment_pipeline?: FulfillmentStep[];
    created_at: string;
    updated_at: string;
}

export interface MediaAsset {
    id: string;
    filename: string;
    content_type: string | null;
    size: number | null;
    storage_key: string;
    alt_text: string | null;
    signed_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ProductListOptions {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
    variantId?: string;
}

export interface Cart {
    id: string;
    items: Array<{
        product: Product;
        quantity: number;
        variantId?: string;
    }>;
    subtotal: number;
    currency: string;
}

export interface CheckoutSession {
    id: string;
    url: string;
    expiresAt: string;
}

export interface StoreInfo {
    id: string;
    name: string;
    subdomain: string;
    theme: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    currency: string;
}

export interface SwatBlocConfig {
    baseUrl?: string;
}

export interface ContentModelField {
    key: string;
    type: 'text' | 'number' | 'boolean' | 'image' | 'date' | 'json' | 'reference';
    label?: string;
    required?: boolean;
}

export interface ContentModelSchema {
    fields: ContentModelField[];
}

export interface ContentModel {
    id: string;
    name: string;
    slug: string;
    schema: ContentModelSchema;
    created_at: string;
}

export interface ContentItem {
    id: string;
    model_id: string;
    store_id: string;
    data: Record<string, any>;
    references: string[];
    created_at: string;
    updated_at: string;
}

export interface ContentListOptions {
    limit?: number;
    offset?: number;
    sort?: string;
    filter?: Record<string, any>;
}

export interface Order {
    id: string;
    store_id: string;
    customer_id?: string;
    stripe_checkout_session_id?: string;
    subtotal_amount: number;
    shipping_amount: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'unpaid' | 'paid' | 'refunded';
    fulfillment_status: 'unfulfilled' | 'fulfilled' | 'partial';
    shipping_address?: Record<string, any>;
    billing_address?: Record<string, any>;
    order_items?: OrderItem[];
    customer?: any;
    created_at: string;
    updated_at: string;
}

/**
 * A step in the fulfillment pipeline.
 * Defines what metadata is required for this step.
 */
export interface FulfillmentStep {
    id: string;
    label: string;
    required_metadata: string[];
}

/**
 * An entry in the step history audit log.
 */
export interface StepHistoryEntry {
    step_id: string;
    completed_at: string;
    metadata: Record<string, any>;
}

export interface OrderItem {
    id: string;
    product_id?: string;
    variant_id?: string;
    quantity: number;
    price_at_purchase: number;
    product_name: string;
    variant_name?: string;
    image_url?: string;
    /** Current step in the fulfillment pipeline */
    current_step_id?: string;
    /** Audit log of completed steps */
    step_history?: StepHistoryEntry[];
}

