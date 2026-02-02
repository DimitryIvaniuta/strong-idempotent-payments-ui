import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite dev proxy so the UI can call /api without CORS during local development.
 * Backend default: http://localhost:8080
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
