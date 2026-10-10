// Central API URL config — reads from Vite env variable.
// In production (Vercel), set VITE_API_URL in Vercel's Environment Variables dashboard.
// In development, create a .env file with: VITE_API_URL=http://localhost:8081
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export default API_URL;
