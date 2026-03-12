import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MAKON/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Boshlash' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page).toHaveURL(/register/);
});

test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Xush Kelibsiz')).toBeVisible();
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
});
