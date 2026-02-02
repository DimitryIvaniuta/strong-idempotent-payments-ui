# strong-idempotent-payments-ui

Production-grade React UI for **Strong Idempotent Payments API**.

Features:
- Professional layout: header, sidebar, footer, responsive central content.
- **New Charge** form that calls `POST /api/payments/charges` with `X-Idempotency-Key`.
- Replay demo (same key + same payload) to prove **no double-charge**.
- Conflict demo (same key + different payload) to show backend `409 CONFLICT`.
- Payment lookup by id (`GET /api/payments/{paymentId}`).
- Essential Playwright e2e tests (API mocked by default; optional “real backend” mode).

## Prerequisites

- Node.js LTS (recommended).
- Backend running locally (optional for default e2e tests).

## Configure

Create `.env` (or export env vars) if your backend is not on the default URL:

```bash
cp .env.example .env
```

## Run locally

```bash
npm i
npm run dev
```

Open: http://localhost:5173

## E2E tests

### Default (mocked API, always deterministic)

```bash
npm run test:e2e
```

### Real backend (must be running)

```bash
E2E_MOCK_API=false npm run test:e2e
```

Backend endpoints expected:
- `POST http://localhost:8080/api/payments/charges`
- `GET  http://localhost:8080/api/payments/{paymentId}`

## Repo suggestion

- **Name:** `strong-idempotent-payments-ui`
- **Description:** React 19 + TypeScript UI for Strong Idempotent Payments API (X-Idempotency-Key + request hash), replay/conflict demos, payment lookup, and Playwright e2e tests.
