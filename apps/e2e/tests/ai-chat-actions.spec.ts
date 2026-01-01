import { test, expect } from '@playwright/test';

/**
 * E2E Tests for AI Chat Actions
 * 
 * These tests verify the AI agent's new capabilities:
 * - BUILD_PAGE action
 * - CREATE_PRODUCTS action
 * - Other existing actions
 */

test.describe('AI Chat Actions', () => {
    // These tests require authentication and a seeded store
    test.beforeEach(async ({ page }) => {
        // Implement auth setup here
        // await loginAsTestUser(page);
    });

    test.describe('BUILD_PAGE Action', () => {
        test('generates complete page layout', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock the AI response for BUILD_PAGE
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'BUILD_PAGE',
                        data: {
                            theme: 'elegant',
                            colors: {
                                primary: '#8B5A2B',
                                secondary: '#F5E6D3',
                                accent: '#D4AF37',
                                background: '#FFFEF7',
                                text: '#2C1810'
                            },
                            blocks: [
                                { type: 'Header', props: { logoText: 'Test Store' } },
                                { type: 'Hero', props: { title: 'Welcome' } },
                                { type: 'ProductGrid', props: { title: 'Products' } },
                                { type: 'Footer', props: {} }
                            ]
                        }
                    })
                });
            });

            // Type a build command
            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Build me an elegant jewelry store homepage');
            await chatInput.press('Enter');

            // Wait for response
            await page.waitForSelector('text=built your page', { timeout: 10000 });

            // Verify success message
            await expect(page.getByText(/built your page/i)).toBeVisible();
        });

        test.skip('updates canvas with new layout', async ({ page }) => {
            // This test requires DOM inspection of the canvas
            // Implementation depends on exact component structure

            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // After BUILD_PAGE, verify canvas shows new components
            // await expect(page.locator('[data-block-type="Hero"]')).toBeVisible();
        });
    });

    test.describe('CREATE_PRODUCTS Action', () => {
        test('creates products via AI chat', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock the AI response for CREATE_PRODUCTS
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'CREATE_PRODUCTS',
                        data: {
                            products: [
                                { title: 'Gold Ring', description: 'Beautiful ring', price: 9999, slug: 'gold-ring' },
                                { title: 'Silver Necklace', description: 'Elegant necklace', price: 7999, slug: 'silver-necklace' }
                            ]
                        }
                    })
                });
            });

            // Mock the Supabase insert call
            await page.route('**/rest/v1/products**', async (route) => {
                if (route.request().method() === 'POST') {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([{ id: 'test-id' }])
                    });
                } else {
                    await route.continue();
                }
            });

            // Type a create products command
            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Create 5 sample jewelry products');
            await chatInput.press('Enter');

            // Wait for response
            await page.waitForSelector('text=created', { timeout: 10000 });

            // Verify success message mentions products
            await expect(page.getByText(/created.*products/i)).toBeVisible();
        });
    });

    test.describe('Existing Actions', () => {
        test('SET_THEME updates colors', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock SET_THEME response
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'SET_THEME',
                        data: {
                            theme: 'dynamic',
                            colors: {
                                primary: '#FF6B6B',
                                secondary: '#4ECDC4',
                                accent: '#FFE66D',
                                background: '#2C3E50',
                                text: '#FFFFFF'
                            }
                        }
                    })
                });
            });

            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Make it look cyberpunk');
            await chatInput.press('Enter');

            await expect(page.getByText(/updated.*theme/i)).toBeVisible({ timeout: 10000 });
        });

        test('CREATE_COMPONENT adds new section', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock CREATE_COMPONENT response
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'CREATE_COMPONENT',
                        data: {
                            type: 'Hero',
                            props: {
                                title: 'Welcome to Our Store',
                                subtitle: 'Shop the best products'
                            }
                        }
                    })
                });
            });

            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Add a hero section');
            await chatInput.press('Enter');

            await expect(page.getByText(/added.*Hero/i)).toBeVisible({ timeout: 10000 });
        });

        test('GENERAL_CHAT provides helpful response', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock GENERAL_CHAT response
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'GENERAL_CHAT',
                        data: {
                            message: 'To improve your SEO, make sure to add descriptive titles and meta descriptions to all your pages.'
                        }
                    })
                });
            });

            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('How can I improve my SEO?');
            await chatInput.press('Enter');

            await expect(page.getByText(/SEO/)).toBeVisible({ timeout: 10000 });
        });
    });

    test.describe('Error Handling', () => {
        test('shows error message on API failure', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Mock API error
            await page.route('**/api/ai/chat', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal server error' })
                });
            });

            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Do something');
            await chatInput.press('Enter');

            await expect(page.getByText(/error/i)).toBeVisible({ timeout: 10000 });
        });

        test('shows loading state while processing', async ({ page }) => {
            await page.goto('/editor/test-store-id?slug=home');
            await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

            // Delay API response
            await page.route('**/api/ai/chat', async (route) => {
                await new Promise(r => setTimeout(r, 2000));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        action: 'GENERAL_CHAT',
                        data: { message: 'Done' }
                    })
                });
            });

            const chatInput = page.locator('textarea[placeholder*="Ask me"]');
            await chatInput.fill('Test loading');
            await chatInput.press('Enter');

            // Should show loading indicator
            await expect(page.getByText('Thinking...')).toBeVisible();
        });
    });
});
