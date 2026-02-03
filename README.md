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

## Fixing intermittent 3–5s latency spikes in dev

If you see some requests taking ~4s in the browser **while the backend logs show ~10–50ms**,
the delay is almost always in the **Vite dev proxy / Node DNS resolution** on Windows.

### Option A (recommended): Keep the proxy, force IPv4

1) Use the updated `vite.config.ts` (this repo already forces `ipv4first` and defaults to `127.0.0.1`).
2) Create `.env` and set:

```bash
VITE_PROXY_TARGET=http://127.0.0.1:8080
```

3) Restart Vite:

```bash
rm -rf node_modules/.vite
npm run dev
```

### Option B: Bypass Vite proxy completely

This is the fastest way to prove the proxy is the culprit.

Create `.env`:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080
```

Restart Vite. The browser will call the backend directly, so make sure backend CORS allows `http://localhost:5173`.

### How to verify where the 4s is spent

In Firefox/Chrome DevTools → Network → select the slow request → **Timings**.
If the time is in **Blocked/DNS/Connecting**, it’s client/proxy; if it’s in **Waiting (TTFB)**, it’s backend.

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
