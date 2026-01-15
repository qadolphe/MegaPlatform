import { ContentItem, ContentListOptions } from './types';

export class Collection {
    constructor(
        private slug: string,
        private publicKey: string,
        private baseUrl: string
    ) {}

    private async request(method: string, path: string, body?: any) {
        const url = `${this.baseUrl}/api/sdk/db/${this.slug}${path}`;
        const headers: Record<string, string> = {
            'X-SwatBloc-Key': this.publicKey,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
             const error = await response.json().catch(() => ({}));
             throw new Error(error.message || `DB Error: ${response.status}`);
        }
        return response.json();
    }

    async list(options?: ContentListOptions): Promise<ContentItem[]> {
        const params = new URLSearchParams();
        if (options?.limit) params.set('limit', options.limit.toString());
        if (options?.offset) params.set('offset', options.offset.toString());
        
        // Simple filter support for now? filter[key]=value
        if (options?.filter) {
            Object.entries(options.filter).forEach(([k, v]) => {
                params.set(`filter[${k}]`, String(v));
            });
        }
        
        return this.request('GET', `?${params.toString()}`);
    }

    async get(id: string): Promise<ContentItem> {
        return this.request('GET', `/${id}`);
    }

    async create(data: Record<string, any>): Promise<ContentItem> {
        return this.request('POST', '', { data });
    }
    
    async update(id: string, data: Record<string, any>): Promise<ContentItem> {
         return this.request('PATCH', `/${id}`, { data });
    }
    
    async delete(id: string): Promise<void> {
         await this.request('DELETE', `/${id}`);
    }
}

export class DBAPI {
    constructor(
        private publicKey: string,
        private baseUrl: string
    ) {}

    collection(slug: string): Collection {
        return new Collection(slug, this.publicKey, this.baseUrl);
    }
}
