import { StoreInfo } from './types';

export class StoreAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * Get store information
     */
    async info(): Promise<StoreInfo> {
        const url = `${this.baseUrl}/api/sdk/store`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Failed to fetch store info: ${response.status}`);
        }

        return response.json();
    }
}
