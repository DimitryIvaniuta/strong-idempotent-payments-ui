import axios from 'axios';

/**
 * Axios instance configured for the backend.
 *
 * In local development we rely on Vite proxy (vite.config.ts) so the browser calls `/api/...`
 * and Vite forwards to the backend, avoiding CORS.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});
