import { CheckoutSession } from './types';

export class CheckoutAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * Create a checkout session for a cart
     */
    async create(cartId: string, options: {
        successUrl: string;
        cancelUrl: string;
    }): Promise<CheckoutSession> {
        const url = `${this.baseUrl}/api/sdk/checkout`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cartId,
                successUrl: options.successUrl,
                cancelUrl: options.cancelUrl
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to create checkout: ${response.status}`);
        }

        return response.json();
    }
}
