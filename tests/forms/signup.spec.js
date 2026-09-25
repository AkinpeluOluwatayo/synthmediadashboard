const { test, expect } = require('@playwright/test');

test.describe('Signup & Policy Modal Suite', () => {
    test('3, 11, 15, 16, 17. Signup validation and Terms Policy Modal behavior', async ({ page }) => {
        await page.goto('/signup');

        // Fill password mismatch to test form validation
        await page.fill('input[name="fullName"]', 'Test E2E User');
        await page.fill('input[name="businessName"]', 'Test Agency Inc');
        await page.fill('input[name="email"]', 'e2e_test_user_unique@example.com');
        await page.fill('input[name="phone"]', '+2348000000000');
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'DifferentPassword456!');

        await page.click('button[type="submit"]');

        // Expect validation error for password mismatch
        const errorBox = page.locator('.bg-red-50');
        await expect(errorBox).toBeVisible();
        await expect(errorBox).toContainText('Passwords do not match');

        // Fix confirm password to match
        await page.fill('input[name="confirmPassword"]', 'Password123!');
        await page.click('button[type="submit"]');

        // 15. Policy Modal appears correctly
        const policyModal = page.locator('text=Terms & Policy Agreement');
        await expect(policyModal).toBeVisible();

        // 16. Modal can be cancelled / closed
        const cancelBtn = page.locator('button:has-text("Cancel")');
        await cancelBtn.click();
        await expect(policyModal).not.toBeVisible();
    });
});
