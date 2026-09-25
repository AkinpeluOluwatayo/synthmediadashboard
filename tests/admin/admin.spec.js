const { test, expect } = require('@playwright/test');

test.describe('Admin Control Center & Management Suite', () => {
    const testAdminEmail = process.env.TEST_ADMIN_EMAIL || 'akinpeluoluwatayo1235@gmail.com';
    const testAdminPassword = process.env.TEST_ADMIN_PASSWORD || '1234567';

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[placeholder="your@company.com"]').fill(testAdminEmail);
        await page.locator('input[placeholder="••••••••"]').fill(testAdminPassword);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/admin/, { timeout: 20000 });
    });

    test('9 & 13. Admin Dashboard UI metrics load correctly', async ({ page }) => {
        // Wait for the page to settle after login redirect
        await page.waitForSelector('h1', { timeout: 10000 });
        await expect(page.locator('h1')).toContainText('Operations Control Center');
        await expect(page.locator('text=Total Revenue')).toBeVisible();
        await expect(page.locator('text=Active Orders')).toBeVisible();
    });

    test('Admin Customer Directory shows user table', async ({ page }) => {
        await page.goto('/admin/customers');
        await page.waitForSelector('h1', { timeout: 10000 });
        // h1 includes the user count e.g. "User & Client Directory (3)"
        await expect(page.locator('h1')).toContainText('User & Client Directory');
        // Table headers confirm it rendered
        await expect(page.locator('th:has-text("User Name")')).toBeVisible();
        await expect(page.locator('th:has-text("Email")')).toBeVisible();
    });

    test('Admin Payments ledger page loads correctly', async ({ page }) => {
        await page.goto('/admin/payments');
        await page.waitForSelector('h1', { timeout: 10000 });
        // Actual h1: "Payments Ledger Audit"
        await expect(page.locator('h1')).toContainText('Payments Ledger Audit');
    });

    test('Admin Services directory page loads correctly', async ({ page }) => {
        await page.goto('/admin/services');
        await page.waitForSelector('h1', { timeout: 10000 });
        // Actual h1: "Services Directory"
        await expect(page.locator('h1')).toContainText('Services Directory');
    });
});
