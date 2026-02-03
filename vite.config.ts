import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'node:dns';

// Windows/Node can resolve `localhost` to IPv6 (::1) first and then fall back to IPv4.
// That fallback often manifests as intermittent ~3–5s latency spikes on proxied requests.
// Force IPv4-first to keep dev requests stable.
dns.setDefaultResultOrder('ipv4first');

/**
 * Vite dev proxy so the UI can call /api without CORS during local development.
 * Backend default: http://localhost:8080
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Use an explicit IPv4 loopback by default to avoid `localhost` IPv6 stalls.
        target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
        changeOrigin: true,
        // Be explicit: don't hang forever if backend is down.
        timeout: 30_000,
        proxyTimeout: 30_000,
      }
    }
  }
});
