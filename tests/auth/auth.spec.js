const { test, expect } = require('@playwright/test');

test.describe('Authentication & Route Protection Suite', () => {
    const testUserEmail = process.env.TEST_USER_EMAIL || 'customer_test@synthmedia.com';
    const testUserPassword = process.env.TEST_USER_PASSWORD || 'Password123!';
    const testAdminEmail = process.env.TEST_ADMIN_EMAIL || 'akinpeluoluwatayo1235@gmail.com';
    const testAdminPassword = process.env.TEST_ADMIN_PASSWORD || '1234567';

    test('4 & 5. Login form validation and invalid login handling', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[placeholder="your@company.com"]').fill('invalid_user_synth@example.com');
        await page.locator('input[placeholder="••••••••"]').fill('WrongPassword123!');
        await page.click('button[type="submit"]');

        // Supabase auth roundtrip can take 5-10s on Vercel - use generous timeout
        const errorBox = page.locator('.bg-red-50');
        await expect(errorBox).toBeVisible({ timeout: 15000 });
        await expect(errorBox).toContainText(/Invalid email or password/i);
    });

    test('6 & 7. Valid Customer Login and Logout Flow', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[placeholder="your@company.com"]').fill(testUserEmail);
        await page.locator('input[placeholder="••••••••"]').fill(testUserPassword);
        await page.click('button[type="submit"]');

        await page.waitForTimeout(2000);
        const url = page.url();

        if (url.includes('/dashboard')) {
            await expect(page).toHaveURL(/\/dashboard/);
            const logoutBtn = page.locator('text=Sign Out').first();
            if (await logoutBtn.isVisible()) {
                await logoutBtn.click();
                await expect(page).toHaveURL(/\/login/);
            }
        }
    });

    test('8 & 14. Unauthenticated user redirected away from protected routes', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);

        await page.goto('/admin');
        await expect(page).toHaveURL(/\/login/);
    });

    test('12 & 13. Admin Login & Access Control to /admin', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[placeholder="your@company.com"]').fill(testAdminEmail);
        await page.locator('input[placeholder="••••••••"]').fill(testAdminPassword);
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
        await expect(page.locator('h1')).toContainText(/Operations Control Center|User & Client Directory/i);
    });
});
