import { http } from './http';
import type { ChargeRequest, ChargeResult, PaymentResponse } from '../types/payments';

const IDEMPOTENCY_KEY_HEADER = 'X-Idempotency-Key';
const IDEMPOTENCY_REPLAYED_HEADER = 'X-Idempotency-Replayed';
const IDEMPOTENCY_REQUEST_HASH_HEADER = 'X-Idempotency-Request-Hash';

/**
 * POST /api/payments/charges
 *
 * Backend returns JSON string body + headers:
 * - X-Idempotency-Key
 * - X-Idempotency-Request-Hash
 * - X-Idempotency-Replayed (optional)
 */
export async function chargePayment(
  idempotencyKey: string,
  payload: ChargeRequest,
): Promise<ChargeResult> {
  const resp = await http.post('/api/payments/charges', payload, {
    headers: { [IDEMPOTENCY_KEY_HEADER]: idempotencyKey },
    // backend returns JSON as string (ResponseEntity<String>)
    responseType: 'json',
    validateStatus: () => true,
  });

  if (resp.status >= 400) {
    // Throw the full Axios response so UI can render details.
    const err = new Error('HTTP error') as Error & { response?: unknown };
    (err as any).response = resp;
    throw err;
  }

  const body = resp.data as PaymentResponse;

  return {
    status: resp.status,
    replayed: String(resp.headers[IDEMPOTENCY_REPLAYED_HEADER.toLowerCase()] ?? '') === 'true',
    idempotencyKey: resp.headers[IDEMPOTENCY_KEY_HEADER.toLowerCase()] ?? idempotencyKey,
    requestHash: resp.headers[IDEMPOTENCY_REQUEST_HASH_HEADER.toLowerCase()] ?? '',
    body,
  };
}

/** GET /api/payments/{paymentId} */
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const resp = await http.get(`/api/payments/${encodeURIComponent(paymentId)}`, {
    validateStatus: () => true,
  });

  if (resp.status >= 400) {
    const err = new Error('HTTP error') as Error & { response?: unknown };
    (err as any).response = resp;
    throw err;
  }
  return resp.data as PaymentResponse;
}
