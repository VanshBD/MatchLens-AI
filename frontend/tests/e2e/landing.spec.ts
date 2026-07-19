import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /MatchLens/i, level: 1 })).toBeVisible();
    await expect(page.getByText('Volunteer Copilot')).toBeVisible();
  });

  test('shows all 6 feature cards', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(6);
  });

  test('has accessible navigation links', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in/i });
    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(signInLink).toBeVisible();
    await expect(registerLink).toBeVisible();
  });

  test('sign in link navigates to login page', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('register link navigates to register page', async ({ page }) => {
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('has no accessibility violations on heading hierarchy', async ({ page }) => {
    const h1Elements = page.getByRole('heading', { level: 1 });
    await expect(h1Elements).toHaveCount(1);
  });

  test('page has lang attribute', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('keyboard navigation works on CTA buttons', async ({ page }) => {
    await page.keyboard.press('Tab');
    // Skip to nav
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
