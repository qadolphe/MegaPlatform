import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Create Next App|MegaPlatform/);
    await expect(page.locator('body')).toBeVisible();
});
