import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('renders login form with correct fields', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /MatchLens AI/i })).toBeVisible();
      await expect(page.getByLabel(/email address/i)).toBeVisible();
      await expect(page.getByLabel(/^password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('shows validation errors for empty form submission', async ({ page }) => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.getByRole('alert').first()).toBeVisible();
    });

    test('shows error for invalid email format', async ({ page }) => {
      await page.getByLabel(/email/i).fill('not-an-email');
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test('toggle password visibility works', async ({ page }) => {
      const passwordInput = page.getByLabel(/^password/i);
      await expect(passwordInput).toHaveAttribute('type', 'password');

      await page.getByRole('button', { name: /show password/i }).click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      await page.getByRole('button', { name: /hide password/i }).click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('has link to register page', async ({ page }) => {
      await page.getByRole('link', { name: /create an account/i }).click();
      await expect(page).toHaveURL('/register');
    });

    test('email field has correct autocomplete attribute', async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toHaveAttribute('autocomplete', 'email');
    });

    test('password field has correct autocomplete attribute', async ({ page }) => {
      await expect(page.getByLabel(/^password/i)).toHaveAttribute(
        'autocomplete',
        'current-password'
      );
    });

    test('submit button is accessible', async ({ page }) => {
      const button = page.getByRole('button', { name: /sign in/i });
      await expect(button).toBeEnabled();
    });

    test('form is keyboard navigable', async ({ page }) => {
      await page.getByLabel(/email/i).focus();
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('renders registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /join the team/i })).toBeVisible();
      await expect(page.getByLabel(/full name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/role/i)).toBeVisible();
    });

    test('role selector has all valid options', async ({ page }) => {
      const roleSelect = page.getByLabel(/role/i);
      await expect(roleSelect.getByRole('option', { name: /volunteer/i })).toBeAttached();
      await expect(roleSelect.getByRole('option', { name: /security/i })).toBeAttached();
      await expect(roleSelect.getByRole('option', { name: /medical/i })).toBeAttached();
      await expect(roleSelect.getByRole('option', { name: /organizer/i })).toBeAttached();
    });

    test('password mismatch shows error', async ({ page }) => {
      await page.getByLabel(/full name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@test.com');
      await page.getByLabel(/^password/i).fill('Password@1');
      await page.getByLabel(/confirm password/i).fill('Different@1');
      await page.getByRole('button', { name: /create account/i }).click();
      await expect(page.getByText(/passwords don't match/i)).toBeVisible();
    });

    test('has link back to login', async ({ page }) => {
      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL('/login');
    });
  });
});
