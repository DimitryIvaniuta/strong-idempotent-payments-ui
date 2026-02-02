export type ChargeRequest = {
  customerId: string;
  amount: number;
  currency: string;
  paymentMethodToken: string;
  description?: string | null;
};

export type PaymentResponse = {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  customerId: string;
  description?: string | null;
  createdAt: string; // ISO instant
};

export type ChargeResult = {
  status: number;
  replayed: boolean;
  idempotencyKey: string;
  requestHash: string;
  body: PaymentResponse;
};

export type ApiProblem = {
  code?: string;
  message?: string;
  timestamp?: string;
  status?: number;
  detail?: string;
  title?: string;
};
