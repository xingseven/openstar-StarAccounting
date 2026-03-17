import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('h1, h2')).toContainText(/登录|Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('input[type="email"]').fill('invalid@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    await expect(page.locator('[role="alert"], .text-red, .text-destructive')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('a[href*="register"]').click();
    
    await expect(page).toHaveURL(/register/);
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});
