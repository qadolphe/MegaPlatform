import { test, expect } from '@playwright/test';

/**
 * SDK Variant API Tests
 * 
 * These tests verify the variant management API endpoints:
 * - /api/sdk/products/{productId}/variants
 * - /api/sdk/products/{productId}/variants/{variantId}
 * - /api/sdk/products/{productId}/variants/generate
 */

// Note: These tests require a valid API key. Set SWATBLOC_TEST_API_KEY env var.
// Skip tests if no API key is available.
const API_KEY = process.env.SWATBLOC_TEST_API_KEY;

test.describe('SDK Variant API', () => {
    // Create a test product for variant operations
    let testProductId: string | null = null;

    test.skip(!API_KEY, 'Skipping: SWATBLOC_TEST_API_KEY not set');

    test.beforeAll(async ({ request }) => {
        if (!API_KEY) return;

        // Create a test product
        const response = await request.post('/api/sdk/products', {
            headers: { 'X-SwatBloc-Key': API_KEY },
            data: {
                title: 'Test Hoodie for Variants',
                price: 4999,
                options: [
                    { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
                    { name: 'Color', values: ['Black', 'Navy'] }
                ],
                published: false
            }
        });

        if (response.ok()) {
            const product = await response.json();
            testProductId = product.id;
        }
    });

    test.afterAll(async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        // Clean up test product
        await request.delete(`/api/sdk/products/${testProductId}`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });
    });

    test('returns 401 without API key', async ({ request }) => {
        const response = await request.get('/api/sdk/products/test-id/variants');
        expect(response.status()).toBe(401);
    });

    test('returns 404 for non-existent product', async ({ request }) => {
        if (!API_KEY) return;

        const response = await request.get('/api/sdk/products/non-existent-id/variants', {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });
        expect(response.status()).toBe(404);
    });

    test('can create a variant', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        const response = await request.post(`/api/sdk/products/${testProductId}/variants`, {
            headers: { 'X-SwatBloc-Key': API_KEY },
            data: {
                title: 'S / Black',
                price: 4999,
                inventory_quantity: 10,
                options: { Size: 'S', Color: 'Black' }
            }
        });

        expect(response.status()).toBe(201);
        const variant = await response.json();
        expect(variant.title).toBe('S / Black');
        expect(variant.price).toBe(4999);
        expect(variant.options.Size).toBe('S');
    });

    test('can list variants', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        const response = await request.get(`/api/sdk/products/${testProductId}/variants`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });

        expect(response.status()).toBe(200);
        const variants = await response.json();
        expect(Array.isArray(variants)).toBe(true);
    });

    test('can generate variants from options', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        const response = await request.post(`/api/sdk/products/${testProductId}/variants/generate`, {
            headers: { 'X-SwatBloc-Key': API_KEY },
            data: { replace_existing: true }
        });

        expect(response.status()).toBe(201);
        const result = await response.json();

        // 4 sizes × 2 colors = 8 variants
        expect(result.variants.length).toBe(8);
        expect(result.message).toContain('8 variants');
    });

    test('can update a variant', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        // First get the variants
        const listResponse = await request.get(`/api/sdk/products/${testProductId}/variants`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });
        const variants = await listResponse.json();

        if (variants.length === 0) return;

        const variantId = variants[0].id;
        const response = await request.patch(`/api/sdk/products/${testProductId}/variants/${variantId}`, {
            headers: { 'X-SwatBloc-Key': API_KEY },
            data: {
                price: 5999,
                inventory_quantity: 25
            }
        });

        expect(response.status()).toBe(200);
        const updated = await response.json();
        expect(updated.price).toBe(5999);
        expect(updated.inventory_quantity).toBe(25);
    });

    test('can delete a variant', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        // First get the variants
        const listResponse = await request.get(`/api/sdk/products/${testProductId}/variants`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });
        const variants = await listResponse.json();

        if (variants.length === 0) return;

        const variantId = variants[0].id;
        const response = await request.delete(`/api/sdk/products/${testProductId}/variants/${variantId}`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });

        expect(response.status()).toBe(200);
        const result = await response.json();
        expect(result.success).toBe(true);
    });

    test('product GET includes variants', async ({ request }) => {
        if (!API_KEY || !testProductId) return;

        const response = await request.get(`/api/sdk/products/${testProductId}`, {
            headers: { 'X-SwatBloc-Key': API_KEY }
        });

        expect(response.status()).toBe(200);
        const product = await response.json();
        expect(Array.isArray(product.variants)).toBe(true);
    });
});
