/**
 * API base URL — same logic everywhere (dev vs production).
 */
export function resolveApiUrl() {
    const rawUrl = import.meta.env.VITE_API_URL?.trim();
    const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    if (rawUrl && (!rawUrl.includes('localhost') || !isProduction)) {
        return rawUrl.replace(/\/$/, '');
    }
    return isProduction ? window.location.origin : 'http://localhost:5000';
}
