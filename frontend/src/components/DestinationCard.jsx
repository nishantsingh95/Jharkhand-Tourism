import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveApiUrl } from '../utils/apiBase';
import './DestinationCard.css';

const DestinationCard = ({ destination }) => {
    // If the DB saved a localhost URL but we are in production, rewrite the URL.
    const [imgSrc, setImgSrc] = useState(() => {
        let url = destination.image || 'https://picsum.photos/seed/travel/800/500';
        if (url.includes('localhost')) {
            const apiUrl = resolveApiUrl();
            url = url.replace(/http:\/\/localhost:\d+/i, apiUrl);
        }
        return url;
    });

    return (
        <div className="destination-card glass-card">
            <div className="card-image-wrapper">
                <img 
                    src={imgSrc} 
                    alt={destination.name} 
                    className="card-image" 
                    onError={() => setImgSrc('https://picsum.photos/seed/Jharkhand/800/500')}
                />
                <div className="card-rating">★ {destination.rating || 'New'}</div>
            </div>
            <div className="card-content">
                <div className="card-header">
                    <h3>{destination.name}</h3>
                </div>
                <p className="card-location">📍 {destination.location}</p>
                <p className="card-description">{destination.description.substring(0, 80)}...</p>
                <Link to={`/book/${destination._id}`} className="btn btn-primary card-btn">View Details</Link>
            </div>
        </div>
    );
};

export default DestinationCard;
