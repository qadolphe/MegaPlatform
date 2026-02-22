import { Order, OrderItem } from './types';

const DISPLAY_ID_REGEX = /^ORD-[A-Z0-9]{8}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_PREFIX_REGEX = /^[0-9a-f-]{6,36}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class OrdersAPI {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) { }

    private async request(method: string, path: string, body?: any) {
        const url = `${this.baseUrl}/api/sdk/orders${path}`;
        const headers: Record<string, string> = {
            'X-SwatBloc-Key': this.apiKey,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Orders API Error: ${response.status}`);
        }
        return response.json();
    }

    /**
     * List orders from the store.
     * Requires Secret Key (sk_live_...).
     */
    async list(options?: { limit?: number; offset?: number; status?: string; sessionId?: string }): Promise<Order[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.offset) params.set('offset', options.offset.toString());
        if (options?.status) params.set('status', options.status);
        if (options?.sessionId) params.set('sessionId', options.sessionId);

        return this.request('GET', `?${params.toString()}`);
    }

    /**
     * Get a single order by ID.
     * Requires Secret Key (sk_live_...).
     */
    async get(id: string): Promise<Order> {
        return this.request('GET', `/${id}`);
    }

    /**
     * Lookup an order by display ID and email (Guest Lookup).
     * Does not require authentication.
     */
    async lookup(displayId: string, email: string): Promise<Order> {
        const normalizedDisplayId = displayId.trim().replace(/^#/, '').toUpperCase();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedDisplayId.length < 6 || normalizedDisplayId.length > 36) {
            throw new Error('Invalid order identifier format');
        }

        if (
            !DISPLAY_ID_REGEX.test(normalizedDisplayId) &&
            !UUID_REGEX.test(normalizedDisplayId) &&
            !UUID_PREFIX_REGEX.test(normalizedDisplayId)
        ) {
            throw new Error('Invalid order identifier format');
        }

        if (normalizedEmail.length < 3 || normalizedEmail.length > 254 || !EMAIL_REGEX.test(normalizedEmail)) {
            throw new Error('Invalid email format');
        }

        const url = `${this.baseUrl}/api/sdk/storefront/orders/lookup?display_id=${encodeURIComponent(normalizedDisplayId)}&email=${encodeURIComponent(normalizedEmail)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Orders API Error: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Update an order.
     * Requires Secret Key (sk_live_...).
     */
    async update(id: string, updates: Partial<Order>): Promise<Order> {
        return this.request('PATCH', `/${id}`, updates);
    }

    /**
     * Transition an order item to a new step in the fulfillment pipeline.
     * Requires Secret Key (sk_live_...).
     * 
     * @param orderId - The order ID
     * @param itemId - The order item ID
     * @param data - Transition data including stepId and optional metadata
     */
    async transitionItem(
        orderId: string,
        itemId: string,
        data: {
            stepId: string;
            metadata?: Record<string, any>;
            status?: 'processing' | 'completed' | 'cancelled';
        }
    ): Promise<OrderItem> {
        return this.request('POST', `/${orderId}/items/${itemId}/transition`, data);
    }
}
