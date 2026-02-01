import { ProductVariant, VariantInput } from './types';

export class VariantsAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * List all variants for a product
     */
    async list(productId: string): Promise<ProductVariant[]> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch variants: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get a single variant by ID
     */
    async get(productId: string, variantId: string): Promise<ProductVariant> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants/${variantId}`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Variant not found: ${variantId}`);
            }
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch variant: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Create a new variant for a product
     */
    async create(productId: string, data: VariantInput): Promise<ProductVariant> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to create variant: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Update an existing variant
     */
    async update(productId: string, variantId: string, data: VariantInput): Promise<ProductVariant> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants/${variantId}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to update variant: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Delete a variant
     */
    async delete(productId: string, variantId: string): Promise<void> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants/${variantId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-SwatBloc-Key': this.publicKey
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to delete variant: ${response.status}`);
        }
    }

    /**
     * Auto-generate variants from product options (Cartesian product)
     * @param productId - The product ID
     * @param replaceExisting - If true, deletes existing variants before generating new ones (default: true)
     * @returns Object containing message and array of created variants
     */
    async generateFromOptions(productId: string, replaceExisting: boolean = true): Promise<{
        message: string;
        variants: ProductVariant[];
    }> {
        const url = `${this.baseUrl}/api/sdk/products/${productId}/variants/generate`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ replace_existing: replaceExisting })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to generate variants: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Bulk update multiple variants at once
     */
    async bulkUpdate(productId: string, updates: Array<{ id: string; data: VariantInput }>): Promise<ProductVariant[]> {
        const results: ProductVariant[] = [];

        for (const { id, data } of updates) {
            const variant = await this.update(productId, id, data);
            results.push(variant);
        }

        return results;
    }
}
