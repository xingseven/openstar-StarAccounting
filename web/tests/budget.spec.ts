import { test, expect } from '@playwright/test';

test.describe('Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@Star Accounting.com');
    await page.locator('input[type="password"]').fill('Admin123.');
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/\//, { timeout: 10000 });
  });

  test('should display budget page', async ({ page }) => {
    await page.goto('/budgets');
    
    await expect(page.locator('h1')).toContainText(/预算/i);
  });

  test('should show budget creation modal', async ({ page }) => {
    await page.goto('/budgets');
    
    await page.locator('button:has-text("新增预算")').click();
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('select, [data-testid="scope-type"]')).toBeVisible();
  });

  test('should create a new budget', async ({ page }) => {
    await page.goto('/budgets');
    
    const initialCount = await page.locator('[data-testid="budget-card"]').count();
    
    await page.locator('button:has-text("新增预算")').click();
    await page.locator('input[type="number"]').fill('5000');
    await page.locator('button:has-text("保存")').click();
    
    await expect(page.locator('[data-testid="budget-card"]')).toHaveCount(initialCount + 1, { timeout: 5000 });
  });

  test('should display budget status indicator', async ({ page }) => {
    await page.goto('/budgets');
    
    const statusBadge = page.locator('[data-testid="budget-status"]');
    if (await statusBadge.count() > 0) {
      await expect(statusBadge.first()).toBeVisible();
      const text = await statusBadge.first().textContent();
      expect(['正常', '预警', '超支']).toContain(text?.trim());
    }
  });
});
