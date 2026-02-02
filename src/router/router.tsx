import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ChargePage } from '../pages/ChargePage';
import { PaymentLookupPage } from '../pages/PaymentLookupPage';
import { IdempotencyPlaygroundPage } from '../pages/IdempotencyPlaygroundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'charges', element: <ChargePage /> },
      { path: 'payments', element: <PaymentLookupPage /> },
      { path: 'idempotency', element: <IdempotencyPlaygroundPage /> },
    ],
  },
]);
