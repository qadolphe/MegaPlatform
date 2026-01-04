import { CartItem, Cart, CheckoutSession } from './types';

export class CartAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * Create a new cart with items
     */
    async create(items: CartItem[]): Promise<Cart> {
        const url = `${this.baseUrl}/api/sdk/cart`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to create cart: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get an existing cart by ID
     */
    async get(cartId: string): Promise<Cart> {
        const url = `${this.baseUrl}/api/sdk/cart/${encodeURIComponent(cartId)}`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Cart not found: ${cartId}`);
            }
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch cart: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Add items to an existing cart
     */
    async addItems(cartId: string, items: CartItem[]): Promise<Cart> {
        const url = `${this.baseUrl}/api/sdk/cart/${encodeURIComponent(cartId)}/items`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to add items: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Update item quantity in cart
     */
    async updateItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
        const url = `${this.baseUrl}/api/sdk/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to update item: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Remove item from cart
     */
    async removeItem(cartId: string, productId: string): Promise<Cart> {
        const url = `${this.baseUrl}/api/sdk/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to remove item: ${response.status}`);
        }

        return response.json();
    }
}
