import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Magic Input Onboarding
 * 
 * These tests verify the new AI-powered store creation:
 * - Single text input interface
 * - Suggestion chips
 * - Store generation flow
 */

test.describe('Magic Input Onboarding', () => {
    test('new store page has magic input interface', async ({ page }) => {
        await page.goto('/new-store');

        // Check for the main heading
        await expect(page.getByText('What do you want to sell?')).toBeVisible();

        // Check for the textarea input
        const input = page.locator('textarea[placeholder*="I want to sell"]');
        await expect(input).toBeVisible();

        // Check for the build button
        const buildButton = page.getByRole('button', { name: /Build My Store/i });
        await expect(buildButton).toBeVisible();

        // Check for suggestion chips
        await expect(page.getByText('I want to sell handmade jewelry')).toBeVisible();
        await expect(page.getByText('Create a streetwear clothing store')).toBeVisible();
    });

    test('suggestion chips fill the input', async ({ page }) => {
        await page.goto('/new-store');

        const input = page.locator('textarea[placeholder*="I want to sell"]');

        // Click a suggestion chip
        await page.getByText('Build a gourmet coffee shop').click();

        // Input should now contain the suggestion text
        await expect(input).toHaveValue('Build a gourmet coffee shop');
    });

    test('build button is disabled when input is empty', async ({ page }) => {
        await page.goto('/new-store');

        const buildButton = page.getByRole('button', { name: /Build My Store/i });

        // Button should be disabled when input is empty
        await expect(buildButton).toBeDisabled();

        // Type something
        const input = page.locator('textarea[placeholder*="I want to sell"]');
        await input.fill('I want to sell vintage books');

        // Button should now be enabled
        await expect(buildButton).toBeEnabled();
    });

    test('shows loading state when building store', async ({ page }) => {
        await page.goto('/new-store');

        // Fill input
        const input = page.locator('textarea[placeholder*="I want to sell"]');
        await input.fill('Test store creation');

        // Click build (we'll check loading state before response)
        const buildButton = page.getByRole('button', { name: /Build My Store/i });

        // Intercept the API call to delay response
        await page.route('**/api/ai/build-store', async (route) => {
            // Delay to see loading state
            await new Promise(r => setTimeout(r, 2000));
            await route.abort(); // Abort to avoid actual creation
        });

        await buildButton.click();

        // Should show loading state
        await expect(page.getByText('Building your store with AI')).toBeVisible();
        await expect(input).toBeDisabled();
    });

    test('displays error message on API failure', async ({ page }) => {
        await page.goto('/new-store');

        // Fill input
        const input = page.locator('textarea[placeholder*="I want to sell"]');
        await input.fill('Test store creation');

        // Mock API failure
        await page.route('**/api/ai/build-store', async (route) => {
            await route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'AI service unavailable' })
            });
        });

        // Click build
        await page.getByRole('button', { name: /Build My Store/i }).click();

        // Should show error message
        await expect(page.getByText('AI service unavailable')).toBeVisible({ timeout: 5000 });
    });

    test('back to dashboard link works', async ({ page }) => {
        await page.goto('/new-store');

        const backLink = page.getByText('Back to Dashboard');
        await expect(backLink).toBeVisible();

        await backLink.click();

        // Should navigate to home/dashboard
        await expect(page).toHaveURL('/');
    });

    test.skip('successfully creates store and redirects to editor', async ({ page }) => {
        // This test requires real API access and authentication
        // Skip by default, enable for integration testing

        await page.goto('/new-store');

        // Fill input with a unique description
        const input = page.locator('textarea[placeholder*="I want to sell"]');
        await input.fill('I want to sell handmade pottery');

        // Click build
        await page.getByRole('button', { name: /Build My Store/i }).click();

        // Wait for redirect to editor
        await page.waitForURL(/\/editor\/.*\?slug=home/, { timeout: 60000 });

        // Editor should load with AI tab active
        await expect(page.locator('[title="AI Assistant"]')).toBeVisible();
    });
});
