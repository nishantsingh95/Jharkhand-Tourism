import { resolveApiUrl } from './apiBase';
import { getCachedDestinations, setCachedDestinations } from './destinationsCache';

function isOffline() {
    return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Fetch destination list; when offline or on failure, returns last successful API payload from localStorage.
 */
export async function loadDestinationsWithCache() {
    const apiUrl = resolveApiUrl();
    const cached = getCachedDestinations();

    if (isOffline() && cached) {
        return { data: cached, source: 'cache' };
    }

    try {
        const res = await fetch(`${apiUrl}/api/destinations`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.length > 0) {
            setCachedDestinations(data);
            return { data, source: 'network' };
        }
        return { data: null, source: 'empty' };
    } catch (e) {
        console.warn('Destinations fetch failed:', e?.message || e);
        if (cached) return { data: cached, source: 'cache' };
        return { data: null, source: 'failed' };
    }
}

/**
 * Single destination by id — uses network first, then cached list from a prior full fetch.
 */
export async function loadDestinationByIdWithCache(id) {
    const apiUrl = resolveApiUrl();
    const cached = getCachedDestinations();
    const fromList = cached?.find(d => d._id === id || d.id === id);

    if (isOffline()) {
        if (fromList) return { data: fromList, source: 'cache' };
        return { data: null, source: 'offline' };
    }

    try {
        const res = await fetch(`${apiUrl}/api/destinations/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.name) return { data, source: 'network' };
    } catch (e) {
        console.warn('Destination detail fetch failed:', e?.message || e);
    }

    if (fromList) return { data: fromList, source: 'cache' };
    return { data: null, source: 'failed' };
}
