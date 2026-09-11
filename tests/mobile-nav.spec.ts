import { expect, test } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('opens mobile nav, links and close button are interactive, and navigation works', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#menuToggle');
    const mobileNav = page.locator('#mobileNav');
    const closeBtn = page.locator('#mobileNavClose');
    const mainContent = page.locator('#main-content');
    const backdrop = page.locator('#mobileNavBackdrop');

    // Hamburger button should be visible on mobile
    await expect(toggle).toBeVisible();

    // Drawer should initially be hidden
    await expect(mobileNav).not.toBeVisible();

    // Click hamburger button to open drawer
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav).toHaveClass(/is-open/);

    // mainContent should be inert, but mobileNav and siteHeader must NOT be inert
    await expect(mainContent).toHaveAttribute('inert', '');
    expect(await mobileNav.getAttribute('inert')).toBeNull();

    // Close button should be clickable and close the menu
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(mobileNav).not.toBeVisible();
    await expect(mainContent).not.toHaveAttribute('inert');

    // Open again to test backdrop click
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    // Click backdrop (on the left side away from the drawer)
    await backdrop.click({ position: { x: 20, y: 100 } });
    await expect(mobileNav).not.toBeVisible();

    // Open again to test clicking a navigation link
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    const blogLink = mobileNav.locator('a[href="/blogs"]');
    await expect(blogLink).toBeVisible();
    await blogLink.click();

    // Verify navigation succeeds to /blogs
    await expect(page).toHaveURL(/\/blogs/);
    await expect(mobileNav).not.toBeVisible();

    // Now test navigating to /academia from /blogs
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    const academiaLink = mobileNav.locator('a[href="/academia"]');
    await expect(academiaLink).toBeVisible();
    await academiaLink.click();
    await expect(page).toHaveURL(/\/academia/);
    await expect(mobileNav).not.toBeVisible();

    // Now test navigating to /projects from /academia
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    const projectsLink = mobileNav.locator('a[href="/projects"]');
    await expect(projectsLink).toBeVisible();
    await projectsLink.click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(mobileNav).not.toBeVisible();

    // Test search button inside mobile nav opens SearchDialog
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    const searchBtn = mobileNav.locator('[data-search-trigger]');
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    await expect(page.locator('#site-search-dialog')).toBeVisible();
    await expect(mobileNav).not.toBeVisible();
  });
});
