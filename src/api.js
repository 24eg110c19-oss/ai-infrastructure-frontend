// Central API URL config
// Uses VITE_API_URL env variable if set (e.g. in Vercel dashboard),
// otherwise falls back to the live Render backend URL.
const API_URL = import.meta.env.VITE_API_URL || "https://ai-infrastructure-platform.onrender.com";

export default API_URL;
