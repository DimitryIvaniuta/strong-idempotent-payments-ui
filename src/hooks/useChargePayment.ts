import { useMutation } from '@tanstack/react-query';
import type { ChargeRequest, ChargeResult } from '../shared/types/payments';
import { chargePayment } from '../shared/api/payments';

export function useChargePayment() {
  return useMutation<ChargeResult, unknown, { idempotencyKey: string; payload: ChargeRequest }>({
    mutationFn: ({ idempotencyKey, payload }) => chargePayment(idempotencyKey, payload),
  });
}
