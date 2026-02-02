/**
 * Generates a safe idempotency key that matches backend validation:
 * regex: ^[A-Za-z0-9._:-]{1,128}$
 */
export function generateIdempotencyKey(): string {
  const now = new Date();
  const rand = Math.random().toString(36).slice(2, 10);
  // Example: web-20260201T194500Z-8chars
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `web-${stamp}-${rand}`.slice(0, 128);
}
