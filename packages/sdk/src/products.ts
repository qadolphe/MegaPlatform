import { Product, ProductListOptions } from './types';

export class ProductsAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * List all products for the store
     */
    async list(options: ProductListOptions = {}): Promise<Product[]> {
        const params = new URLSearchParams();
        if (options.limit) params.set('limit', String(options.limit));
        if (options.offset) params.set('offset', String(options.offset));
        if (options.category) params.set('category', options.category);
        if (options.search) params.set('search', options.search);

        const url = `${this.baseUrl}/api/sdk/products?${params.toString()}`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch products: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get a single product by ID or slug
     */
    async get(idOrSlug: string): Promise<Product> {
        const url = `${this.baseUrl}/api/sdk/products/${encodeURIComponent(idOrSlug)}`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Product not found: ${idOrSlug}`);
            }
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch product: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get products by category
     */
    async byCategory(category: string, options: Omit<ProductListOptions, 'category'> = {}): Promise<Product[]> {
        return this.list({ ...options, category });
    }

    /**
     * Search products
     */
    async search(query: string, options: Omit<ProductListOptions, 'search'> = {}): Promise<Product[]> {
        return this.list({ ...options, search: query });
    }
}
