import type { Page } from '@playwright/test';

/**
 * Mocks the backend API for deterministic e2e tests.
 *
 * Enable by default; disable with: E2E_MOCK_API=false
 */
export async function installMockApi(page: Page) {
  const enabled = (process.env.E2E_MOCK_API ?? 'true').toLowerCase() !== 'false';
  if (!enabled) return;

  // In-memory store to mimic idempotency persistence: key -> { payload, response }
  const store: Record<string, { payloadJson: string; responseJson: any }> = {};

  await page.route('**/api/payments/charges', async (route) => {
    const req = route.request();
    const key = req.headers()['x-idempotency-key'] ?? '';
    const payload = await req.postDataJSON();

    if (!key) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'BAD_REQUEST', message: 'Missing X-Idempotency-Key' }),
      });
    }

    const payloadJson = JSON.stringify(payload);

    if (store[key]) {
      if (store[key].payloadJson !== payloadJson) {
        return route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'CONFLICT',
            message: `Idempotency key '${key}' was already used with a different request payload.`,
          }),
          headers: {
            'x-idempotency-key': key,
            'x-idempotency-request-hash': 'mock-hash',
          },
        });
      }

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(store[key].responseJson),
        headers: {
          'x-idempotency-key': key,
          'x-idempotency-request-hash': 'mock-hash',
          'x-idempotency-replayed': 'true',
        },
      });
    }

    const paymentId = `pay_${Math.random().toString(36).slice(2, 10)}`;
    const responseJson = {
      paymentId,
      status: 'CREATED',
      amount: payload.amount,
      currency: payload.currency,
      customerId: payload.customerId,
      description: payload.description ?? null,
      createdAt: new Date().toISOString(),
    };

    store[key] = { payloadJson, responseJson };

    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(responseJson),
      headers: {
        'x-idempotency-key': key,
        'x-idempotency-request-hash': 'mock-hash',
      },
    });
  });

  await page.route('**/api/payments/*', async (route) => {
    const enabled = (process.env.E2E_MOCK_API ?? 'true').toLowerCase() !== 'false';
    if (!enabled) return route.continue();

    const url = new URL(route.request().url());
    const parts = url.pathname.split('/');
    const paymentId = parts[parts.length - 1];

    // Find by scanning store
    const rec = Object.values(store).find((v) => v.responseJson.paymentId === paymentId);
    if (!rec) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'NOT_FOUND', message: 'Payment not found' }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rec.responseJson),
    });
  });
}
