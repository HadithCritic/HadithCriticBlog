import { expect, test } from '@playwright/test';

test.describe('Home Page Mobile Filter Tabs', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('filter pills render with correct pill height and filter entries on click', async ({ page }) => {
    await page.goto('/');

    const filterContainer = page.locator('.home-ledger-filters');
    await filterContainer.scrollIntoViewIfNeeded();
    await expect(filterContainer).toBeVisible();

    // Check that pills are not vertically stretched into tall ovals
    const allTab = page.locator('.home-filter-tab[data-home-filter="all"]');
    await expect(allTab).toBeVisible();
    const box = await allTab.boundingBox();
    expect(box).not.toBeNull();
    // Pill should be compact (~36px high), never 100px+
    expect(box!.height).toBeLessThan(45);
    expect(box!.height).toBeGreaterThan(28);

    // Test clicking a category filter
    const originsTab = page.locator('.home-filter-tab').nth(1);
    await originsTab.click();
    await expect(originsTab).toHaveClass(/is-active/);
    await expect(allTab).not.toHaveClass(/is-active/);

    // Check that rows updated and match category
    const visibleRows = page.locator('.home-ledger-row:not([hidden])');
    const count = await visibleRows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);

    // Switch back to All
    await allTab.click();
    await expect(allTab).toHaveClass(/is-active/);
    await expect(originsTab).not.toHaveClass(/is-active/);
  });
});
