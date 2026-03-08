import { CustomerRequest } from './types';

export class RequestsAPI {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) { }

    private async request(method: string, path: string, body?: any) {
        const url = `${this.baseUrl}/api/sdk/requests${path}`;
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
            throw new Error(error.message || `Requests API Error: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Submit a customer request (domain request, feature request, etc.).
     * Requires Secret Key (sk_live_...).
     *
     * @param type - The request type (e.g., 'domain_request', 'feature_request')
     * @param payload - Arbitrary data for the request
     */
    async submitRequest(type: string, payload: Record<string, any>): Promise<CustomerRequest> {
        return this.request('POST', '', { type, payload });
    }
}
