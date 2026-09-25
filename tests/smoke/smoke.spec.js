const { test, expect } = require('@playwright/test');

test.describe('Smoke & Core Navigation Suite', () => {
    test('1. Homepage redirects to login or loads successfully', async ({ page }) => {
        await page.goto('/');
        // App redirects / to /login
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('h2')).toContainText('Welcome Back');
    });

    test('2. Navigation links between Login and Signup work correctly', async ({ page }) => {
        await page.goto('/login');

        // Click "Create an account"
        await page.click('text=Create an account');
        await expect(page).toHaveURL(/\/signup/);
        await expect(page.locator('h2')).toContainText('Create your Synth account');

        // Click "Sign In" link on signup page
        await page.click('text=Sign In');
        await expect(page).toHaveURL(/\/login/);
    });

    test('3. Forgot password navigation link works', async ({ page }) => {
        await page.goto('/login');
        await page.click('text=Forgot password?');
        await expect(page).toHaveURL(/\/forgot-password/);
    });
});
