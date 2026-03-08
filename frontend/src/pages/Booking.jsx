import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/destinations/${id}`)
            .then(res => res.json())
            .then(data => setDestination(data))
            .catch(err => console.error("Error fetching destination", err));
    }, [id]);

    if (!destination) return <div className="container" style={{ paddingTop: '8rem' }}>Loading details...</div>;

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= Math.round(rating) ? 'filled' : ''}`}>★</span>
            );
        }
        return stars;
    };

    return (
        <div className="booking-page container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <div className="booking-layout">
                <div className="booking-details">
                    <img src={destination.image} alt={destination.name} className="booking-image" />
                    <h1 className="booking-title">{destination.name}</h1>
                    <p className="booking-location">📍 {destination.location}</p>
                    <p className="booking-desc">{destination.description}</p>
                </div>

                <div className="destination-info-wrapper glass-card">
                    <h2>Destination Information</h2>

                    <div className="info-group">
                        <h3>Rating</h3>
                        <div className="rating-stars">
                            {renderStars(destination.rating || 4.5)}
                            <span className="rating-number">({destination.rating || 4.5}/5)</span>
                        </div>
                    </div>

                    <div className="info-group">
                        <h3>Time Required to Explore</h3>
                        <p className="info-text">⏳ {destination.exploreTime || "Half Day"}</p>
                    </div>

                    <div className="info-group">
                        <h3>Best Time to Visit</h3>
                        <p className="info-text">🌦️ {destination.bestTimeToVisit || "October to March"}</p>
                    </div>

                    <div className="info-group action-group">
                        <button className="btn btn-secondary btn-block btn-back-pill" onClick={() => navigate('/destinations')}>
                            <span className="back-icon">←</span> Back to Destinations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
