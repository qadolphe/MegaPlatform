import { Order } from './types';

export class OrdersAPI {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) {}

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
    async list(options?: { limit?: number; offset?: number; status?: string }): Promise<Order[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.offset) params.set('offset', options.offset.toString());
        if (options?.status) params.set('status', options.status);
        
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
     * Update an order.
     * Requires Secret Key (sk_live_...).
     */
    async update(id: string, updates: Partial<Order>): Promise<Order> {
         return this.request('PATCH', `/${id}`, updates);
    }
}
