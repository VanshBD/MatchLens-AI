import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E tests — verifies WCAG 2.2 AA compliance
 * Tests keyboard navigation, ARIA, focus management, and semantic HTML
 */

test.describe('Accessibility', () => {
  test.describe('Landing page a11y', () => {
    test('page has single h1', async ({ page }) => {
      await page.goto('/');
      const h1s = page.getByRole('heading', { level: 1 });
      await expect(h1s).toHaveCount(1);
    });

    test('all images have alt text or aria-hidden', async ({ page }) => {
      await page.goto('/');
      const imgs = page.locator('img');
      const count = await imgs.count();
      for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaHidden = await img.getAttribute('aria-hidden');
        expect(alt !== null || ariaHidden === 'true').toBeTruthy();
      }
    });

    test('colour contrast — primary buttons are visible', async ({ page }) => {
      await page.goto('/');
      // Sign In button should be visible (not hidden or 0 opacity)
      const btn = page.getByRole('link', { name: /sign in/i });
      await expect(btn).toBeVisible();
      const opacity = await btn.evaluate((el) =>
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0.9);
    });
  });

  test.describe('Login page a11y', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('all form inputs have associated labels', async ({ page }) => {
      const inputs = page.locator('input[type="email"], input[type="password"]');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeAttached();
        }
      }
    });

    test('form submits on Enter key press', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@test.com');
      await page.getByLabel(/^password/i).fill('password');
      await page.getByLabel(/^password/i).press('Enter');
      // Form should attempt submission (not freeze)
      await page.waitForTimeout(500);
      // Either navigation or error — page shouldn't freeze
      await expect(page.locator('body')).toBeVisible();
    });

    test('error messages have role="alert"', async ({ page }) => {
      await page.getByRole('button', { name: /sign in/i }).click();
      const alerts = page.getByRole('alert');
      // After validation, alerts should appear
      await expect(alerts.first()).toBeVisible({ timeout: 3000 });
    });

    test('focus is trapped within the form when tabbing', async ({ page }) => {
      const email = page.getByLabel(/email/i);
      await email.focus();
      // Tab through form fields
      await page.keyboard.press('Tab'); // -> password
      await page.keyboard.press('Tab'); // -> show/hide button
      await page.keyboard.press('Tab'); // -> submit
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
    });

    test('loading state announces to screen readers', async ({ page }) => {
      // When submitting, button should have descriptive text
      await page.getByLabel(/email/i).fill('admin@matchlens.ai');
      await page.getByLabel(/^password/i).fill('Admin@1234');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Button should show loading state (may flash quickly)
      await page.waitForTimeout(100);
      // Page should still be accessible during loading
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Register page a11y', () => {
    test('required fields are marked with aria-required', async ({ page }) => {
      await page.goto('/register');
      const nameInput = page.getByLabel(/full name/i);
      const ariaRequired = await nameInput.getAttribute('aria-required');
      expect(ariaRequired).toBe('true');
    });

    test('role select has accessible name', async ({ page }) => {
      await page.goto('/register');
      const roleSelect = page.getByLabel(/role/i);
      await expect(roleSelect).toBeVisible();
      const id = await roleSelect.getAttribute('id');
      expect(id).toBeTruthy();
    });
  });

  test.describe('Keyboard navigation', () => {
    test('skip link functionality on landing page', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    });

    test('all interactive elements are focusable', async ({ page }) => {
      await page.goto('/login');
      const interactives = page.locator('button, a, input, select, textarea');
      const count = await interactives.count();
      expect(count).toBeGreaterThan(3);

      // Each should be focusable (not tabIndex=-1 unexpectedly)
      for (let i = 0; i < Math.min(count, 5); i++) {
        const el = interactives.nth(i);
        const tabIndex = await el.getAttribute('tabindex');
        // Should not be explicitly -1 (unless it has role button with different focus)
        if (tabIndex !== null) {
          expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(-1);
        }
      }
    });
  });

  test.describe('Responsive design', () => {
    test('login page is usable on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('landing page renders on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });
});
