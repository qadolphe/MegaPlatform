import { MediaAsset } from './types';

export class MediaAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) { }

    /**
     * List all media assets in the content library
     */
    async list(options?: { search?: string; limit?: number; offset?: number }): Promise<MediaAsset[]> {
        const query = new URLSearchParams();
        if (options?.search) query.append('search', options.search);
        if (options?.limit) query.append('limit', options.limit.toString());
        if (options?.offset) query.append('offset', options.offset.toString());

        const url = `${this.baseUrl}/api/sdk/media?${query.toString()}`;
        const response = await fetch(url, {
            headers: {
                'X-SwatBloc-Key': this.publicKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch media assets: ${response.status}`);
        }

        return response.json();
    }
}
