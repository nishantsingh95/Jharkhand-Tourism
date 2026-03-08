import React from 'react';
import { Link } from 'react-router-dom';
import './DestinationCard.css';

const DestinationCard = ({ destination }) => {
    return (
        <div className="destination-card glass-card">
            <div className="card-image-wrapper">
                <img src={destination.image} alt={destination.name} className="card-image" />
                <div className="card-rating">★ {destination.rating}</div>
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
