/**
 * Environment-aware API URL detection utility
 * 
 * Priority:
 * 1. VITE_API_URL environment variable (production)
 * 2. Localhost detection (development)
 * 3. Fallback to production URL
 */

export function getApiBaseUrl(): string {
  // First priority: use VITE_API_URL env var (usually for production)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log('[API] Using VITE_API_URL:', envUrl);
    return envUrl;
  }

  // Fallback: detect environment and use appropriate base URL
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const port = window.location.port;

  if (isLocalhost && !port) {
    // development mode with default ports
    const apiUrl = 'http://localhost:5000/api';
    console.log('[API] Development mode (no port), using local API:', apiUrl);
    return apiUrl;
  } else if (isLocalhost && port === '5173') {
    // Vite dev server on port 5173
    const apiUrl = 'http://localhost:5000/api';
    console.log('[API] Vite dev mode (port 5173), using local API:', apiUrl);
    return apiUrl;
  } else if (isLocalhost && port === '5174') {
    // Vite auto-switched to 5174
    const apiUrl = 'http://localhost:5000/api';
    console.log('[API] Vite dev mode (port 5174), using local API:', apiUrl);
    return apiUrl;
  } else if (isLocalhost && port === '5175') {
    // Vite auto-switched to 5175
    const apiUrl = 'http://localhost:5000/api';
    console.log('[API] Vite dev mode (port 5175), using local API:', apiUrl);
    return apiUrl;
  }

  // Default: assume production
  const fallbackUrl = 'https://jualanonline-production.up.railway.app/api';
  console.log('[API] Production mode detected, using Railway API:', fallbackUrl);
  return fallbackUrl;
}
