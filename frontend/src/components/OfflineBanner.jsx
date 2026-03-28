import React, { useState, useEffect } from 'react';
import './OfflineBanner.css';

const OfflineBanner = () => {
    const [offline, setOffline] = useState(
        () => typeof navigator !== 'undefined' && !navigator.onLine
    );

    useEffect(() => {
        const onOnline = () => setOffline(false);
        const onOffline = () => setOffline(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    if (!offline) return null;

    return (
        <div role="status" className="offline-banner" aria-live="polite">
            You are offline — saved pages still work. Sign-in and live AI need the internet.{' '}
            <span className="offline-banner-sub">
                Install from the browser menu after one online visit for the best experience.
            </span>
        </div>
    );
};

export default OfflineBanner;
