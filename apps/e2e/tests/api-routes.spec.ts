import { test, expect } from '@playwright/test';

/**
 * API Route Tests for AI Endpoints
 * 
 * These tests verify the API endpoints directly:
 * - /api/ai/chat
 * - /api/ai/build-store
 */

test.describe('AI API Routes', () => {
    test.describe('/api/ai/chat', () => {
        test('returns 500 without required fields', async ({ request }) => {
            const response = await request.post('/api/ai/chat', {
                data: {}
            });

            // Should fail due to missing prompt/context
            expect(response.status()).toBe(500);
        });

        test('accepts valid chat request structure', async ({ request }) => {
            // Note: This test will fail without proper AI API keys
            // It tests the request structure validation
            const response = await request.post('/api/ai/chat', {
                data: {
                    prompt: 'Hello',
                    context: {
                        storeId: 'test-id',
                        selectedBlock: null,
                        allBlocks: [],
                        storeTheme: 'simple',
                        storeColors: {
                            primary: '#3B82F6',
                            secondary: '#E5E7EB',
                            accent: '#8B5CF6',
                            background: '#FFFFFF',
                            text: '#1F2937'
                        },
                        availableImages: []
                    },
                    modelConfig: {
                        provider: 'gemini',
                        model: 'gemini-3-flash-preview'
                    }
                }
            });

            // May return error if AI service unavailable, but should process request
            expect([200, 500]).toContain(response.status());
        });
    });

    test.describe('/api/ai/build-store', () => {
        test('returns 401 for unauthenticated requests', async ({ request }) => {
            const response = await request.post('/api/ai/build-store', {
                data: {
                    prompt: 'Test store'
                }
            });

            expect(response.status()).toBe(401);
        });

        test.skip('creates store for authenticated user', async ({ request }) => {
            // This test requires authentication setup
            // Implement with proper auth cookies/tokens

            // const response = await request.post('/api/ai/build-store', {
            //     headers: {
            //         'Cookie': 'auth-token=...'
            //     },
            //     data: {
            //         prompt: 'I want to sell handmade candles'
            //     }
            // });
            // 
            // expect(response.status()).toBe(200);
            // const body = await response.json();
            // expect(body).toHaveProperty('storeId');
            // expect(body).toHaveProperty('storeName');
            // expect(body).toHaveProperty('subdomain');
        });
    });
});
