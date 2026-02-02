import { useQuery } from '@tanstack/react-query';
import { getPayment } from '../shared/api/payments';
import type { PaymentResponse } from '../shared/types/payments';

export function usePayment(paymentId: string | null) {
  return useQuery<PaymentResponse>({
    queryKey: ['payment', paymentId],
    queryFn: () => getPayment(paymentId!),
    enabled: Boolean(paymentId),
    retry: 1,
  });
}
