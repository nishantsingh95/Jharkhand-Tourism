const CACHE_KEY = 'jharkhand_destinations_cache_v1';

export function getCachedDestinations() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return Array.isArray(data) && data.length ? data : null;
    } catch {
        return null;
    }
}

export function setCachedDestinations(list) {
    if (!Array.isArray(list) || !list.length) return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn('Could not save destinations for offline use:', e);
    }
}
