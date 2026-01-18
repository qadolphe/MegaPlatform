/**
 * SwatBloc SDK Types
 */

export interface Product {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    images: string[];
    category: string | null;
    sku: string | null;
    barcode: string | null;
    inventory_quantity: number;
    weight: number | null;
    weight_unit: string;
    published: boolean;
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
