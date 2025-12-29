
import { test, expect } from '@playwright/test';

// This test requires a seeded database with a known user and store.
// Run with: npx playwright test tests/editor-grid.spec.ts
test.skip('Editor Grid Reordering', async ({ page }) => {
    // 1. Login (Mock or UI)
    await page.goto('/login');
    // Fill credentials...

    // 2. Navigate to Editor
    // await page.goto('/editor/STORE_ID');

    // 3. Add Product Grid Block
    // await page.getByText('Commerce').click();
    // await page.getByText('Product Grid').click();

    // 4. Set to Manual Selection
    // await page.getByLabel('Source').selectOption('manual');

    // 5. Open Picker
    // await page.getByText('Select Products').click();
    // await page.getByText('Done').click();

    // 6. Test Reordering
    // const firstItem = page.locator('.product-item').first();
    // await page.locator('.move-down').first().click();
    // await expect(page.locator('.product-item').first()).not.toHaveText(originalFirstText);
});
