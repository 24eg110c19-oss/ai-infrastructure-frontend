// In production (Vercel), requests go to /api/* which Vercel proxies to Render backend.
// This eliminates CORS entirely — the browser only talks to Vercel (same origin).
// In local development, it falls back to localhost:8081.
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:8081");

export default API_URL;
