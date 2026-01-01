import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Editor AI Mode Interface
 * 
 * These tests verify the new AI-first editor experience:
 * - AI tab is default
 * - Mode toggle works
 * - Sidebar adapts to mode
 */

test.describe('Editor AI Mode', () => {
    // Skip if not authenticated - these tests require a seeded store
    test.beforeEach(async ({ page }) => {
        // For real testing, implement auth flow or use test cookies
        // await loginAsTestUser(page);
    });

    test('AI tab is the default active tab', async ({ page }) => {
        // Navigate to editor with a test store
        // Replace with actual test store ID from seeded data
        await page.goto('/editor/test-store-id?slug=home');

        // Wait for editor to load
        await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

        // Check that AI tab is active (has the blue underline indicator)
        const aiTab = page.locator('[title="AI Assistant"]');
        await expect(aiTab).toBeVisible();

        // The AI tab should have the active indicator (absolute positioned div)
        const activeIndicator = aiTab.locator('.bg-blue-600');
        await expect(activeIndicator).toBeVisible();
    });

    test('mode toggle switches between AI and Advanced modes', async ({ page }) => {
        await page.goto('/editor/test-store-id?slug=home');
        await page.waitForSelector('[title="AI Mode"]', { timeout: 10000 });

        // AI Mode should be active by default (has gradient styling)
        const aiModeButton = page.locator('[title="AI Mode"]');
        await expect(aiModeButton).toHaveClass(/from-purple-600/);

        // Click Advanced mode
        const advancedButton = page.locator('[title="Advanced Tweaks"]');
        await advancedButton.click();

        // Advanced should now be active
        await expect(advancedButton).toHaveClass(/bg-slate-700/);

        // Components tab should now be visible
        const componentsTab = page.locator('[title="Components"]');
        await expect(componentsTab).toBeVisible();

        // Switch back to AI mode
        await aiModeButton.click();

        // Components tab should be hidden
        await expect(componentsTab).not.toBeVisible();
    });

    test('AI mode shows only AI and Theme tabs', async ({ page }) => {
        await page.goto('/editor/test-store-id?slug=home');
        await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

        // In AI mode, only AI and Theme tabs should be visible
        await expect(page.locator('[title="AI Assistant"]')).toBeVisible();
        await expect(page.locator('[title="Theme"]')).toBeVisible();

        // Components, Properties, Media should NOT be visible
        await expect(page.locator('[title="Components"]')).not.toBeVisible();
        await expect(page.locator('[title="Properties"]')).not.toBeVisible();
        await expect(page.locator('[title="Media"]')).not.toBeVisible();
    });

    test('Advanced mode shows all five tabs', async ({ page }) => {
        await page.goto('/editor/test-store-id?slug=home');
        await page.waitForSelector('[title="AI Mode"]', { timeout: 10000 });

        // Switch to Advanced mode
        await page.locator('[title="Advanced Tweaks"]').click();

        // All tabs should be visible
        await expect(page.locator('[title="Components"]')).toBeVisible();
        await expect(page.locator('[title="Properties"]')).toBeVisible();
        await expect(page.locator('[title="Media"]')).toBeVisible();
        await expect(page.locator('[title="AI Assistant"]')).toBeVisible();
        await expect(page.locator('[title="Theme"]')).toBeVisible();
    });

    test('sidebar expands in AI mode', async ({ page }) => {
        await page.goto('/editor/test-store-id?slug=home');
        await page.waitForSelector('[title="AI Mode"]', { timeout: 10000 });

        // Get sidebar width in AI mode (should be w-96 = 384px)
        const sidebar = page.locator('.flex-col.shadow-xl.z-40').first();
        const aiModeBox = await sidebar.boundingBox();

        // Switch to Advanced mode
        await page.locator('[title="Advanced Tweaks"]').click();
        await page.waitForTimeout(400); // Wait for transition

        const advancedModeBox = await sidebar.boundingBox();

        // AI mode sidebar should be wider
        expect(aiModeBox!.width).toBeGreaterThan(advancedModeBox!.width);
    });

    test('AI chat interface is functional', async ({ page }) => {
        await page.goto('/editor/test-store-id?slug=home');
        await page.waitForSelector('[title="AI Assistant"]', { timeout: 10000 });

        // Chat input should be visible
        const chatInput = page.locator('textarea[placeholder*="Ask me"]');
        await expect(chatInput).toBeVisible();

        // Welcome message should be present
        await expect(page.getByText(/I'm your AI assistant/)).toBeVisible();

        // Submit button should be present
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
    });
});
