import { test as base, expect, Page } from '@playwright/test';

/**
 * Test fixtures for MegaPlatform E2E tests
 * 
 * Provides common utilities and authenticated page contexts
 */

// Extend the base test with custom fixtures
export const test = base.extend<{
    authenticatedPage: Page;
    testStoreId: string;
}>({
    // Fixture for authenticated page - implement based on your auth system
    authenticatedPage: async ({ page }, use) => {
        // Option 1: Use environment variable for test user credentials
        const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
        const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

        // Option 2: Navigate to login and authenticate
        // await page.goto('/login');
        // await page.fill('input[type="email"]', testEmail);
        // await page.fill('input[type="password"]', testPassword);
        // await page.click('button[type="submit"]');
        // await page.waitForURL('/'); // Wait for redirect after login

        // Option 3: Set auth cookies directly (faster for tests)
        // await page.context().addCookies([{
        //     name: 'sb-access-token',
        //     value: process.env.TEST_ACCESS_TOKEN || '',
        //     domain: 'localhost',
        //     path: '/'
        // }]);

        await use(page);
    },

    // Fixture for test store ID - can be seeded or created per test
    testStoreId: async ({ }, use) => {
        // Use a pre-seeded test store ID
        const storeId = process.env.TEST_STORE_ID || 'test-store-id';
        await use(storeId);
    }
});

export { expect };

// Helper functions
export async function waitForEditorLoad(page: Page) {
    await page.waitForSelector('[title="AI Assistant"]', { timeout: 15000 });
}

export async function sendChatMessage(page: Page, message: string) {
    const chatInput = page.locator('textarea[placeholder*="Ask me"]');
    await chatInput.fill(message);
    await chatInput.press('Enter');
}

export async function waitForChatResponse(page: Page) {
    // Wait for thinking indicator to disappear
    await page.waitForSelector('text=Thinking...', { state: 'hidden', timeout: 30000 });
}

export async function switchToAdvancedMode(page: Page) {
    await page.locator('[title="Advanced Tweaks"]').click();
    await page.waitForSelector('[title="Components"]', { timeout: 5000 });
}

export async function switchToAiMode(page: Page) {
    await page.locator('[title="AI Mode"]').click();
    await page.waitForSelector('[title="Components"]', { state: 'hidden', timeout: 5000 });
}

export async function mockAiChatResponse(page: Page, response: object) {
    await page.route('**/api/ai/chat', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response)
        });
    });
}

export async function mockBuildStoreResponse(page: Page, response: object) {
    await page.route('**/api/ai/build-store', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response)
        });
    });
}

// Sample mock responses for testing
export const mockResponses = {
    buildPage: {
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
                { type: 'Hero', props: { title: 'Welcome', subtitle: 'Shop our collection' } },
                { type: 'ProductGrid', props: { title: 'Featured Products', columns: 4 } },
                { type: 'Footer', props: { copyright: '© 2026 Test Store' } }
            ]
        }
    },
    createProducts: {
        action: 'CREATE_PRODUCTS',
        data: {
            products: [
                { title: 'Product 1', description: 'Description 1', price: 2999, slug: 'product-1' },
                { title: 'Product 2', description: 'Description 2', price: 3999, slug: 'product-2' },
                { title: 'Product 3', description: 'Description 3', price: 4999, slug: 'product-3' }
            ]
        }
    },
    setTheme: {
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
    },
    generalChat: {
        action: 'GENERAL_CHAT',
        data: {
            message: 'I can help you with building your store!'
        }
    },
    buildStore: {
        storeId: 'new-test-store-id',
        storeName: 'Test Store',
        subdomain: 'test-store'
    }
};
