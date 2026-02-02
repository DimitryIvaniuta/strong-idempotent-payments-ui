import type { ApiProblem } from '../types/payments';

/**
 * Extracts a user-friendly error from an Axios error-like object.
 * Backend may return:
 * - custom { code, message, timestamp }
 * - RFC7807 ProblemDetail
 */
export function extractApiProblem(err: unknown): ApiProblem {
  const anyErr: any = err;
  const resp = anyErr?.response;

  const status = resp?.status as number | undefined;
  const data = resp?.data;

  if (data && typeof data === 'object') {
    const d = data as any;
    return {
      code: d.code,
      message: d.message ?? d.detail,
      timestamp: d.timestamp,
      status: status ?? d.status,
      title: d.title,
      detail: d.detail,
    };
  }

  return {
    status,
    message: anyErr?.message ?? 'Unexpected error',
  };
}
