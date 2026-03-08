import React, { useEffect } from 'react';
import AITripPlanner from '../components/AITripPlanner';

const Itinerary = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="itinerary-page" style={{ paddingTop: '100px', paddingBottom: '5rem', minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
            <div className="container px-4">
                <h1 style={{ textAlign: 'center', margin: '0.5rem 0', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
                    Craft Your Perfect <span style={{ color: 'var(--accent)' }}>Itinerary</span>
                </h1>
                <AITripPlanner />
            </div>
        </div>
    );
};

export default Itinerary;
