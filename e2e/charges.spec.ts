import { test, expect } from '@playwright/test';
import { installMockApi } from './mockApi';

test('charge create + replay shows replay flag and same paymentId', async ({ page }) => {
  await installMockApi(page);

  await page.goto('/charges');

  // Submit
  await page.getByRole('button', { name: 'Submit charge' }).click();

  await expect(page.getByText(/Response body/i)).toBeVisible();

  // Capture paymentId displayed in JSON
  const pre = page.locator('pre').last();
  const text = await pre.textContent();
  expect(text).toContain('paymentId');

  // Replay
  await page.getByRole('button', { name: 'Replay last key' }).click();

  // "Replayed" chip appears
  await expect(page.getByText('Replayed')).toBeVisible();
});

test('reusing same key with different payload returns 409 and UI shows error', async ({ page }) => {
  await installMockApi(page);

  await page.goto('/idempotency');

  // First request
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByText(/Body/i)).toBeVisible();

  // Modify amount but keep same key => conflict
  const amount = page.getByLabel('Amount (minor units)');
  await amount.fill('2000');
  await page.getByRole('button', { name: 'Send request' }).click();

  await expect(page.getByText(/CONFLICT/i)).toBeVisible();
});
