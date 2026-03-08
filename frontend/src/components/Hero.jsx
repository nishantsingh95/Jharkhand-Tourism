import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <div className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content container animate-fade-in">
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '2px', fontWeight: '600' }}>
                    ✨ AI-POWERED PLATFORM
                </div>
                <h1 className="hero-title">Experience the Soul of <span className="hero-highlight">India</span></h1>
                <p className="hero-subtitle">Discover the untouched beauty, roaring waterfalls, and vibrant tribal culture of Jharkhand.</p>
                <div className="hero-buttons">
                    <Link to="/destinations" className="btn btn-primary btn-lg">Explore Destinations</Link>
                    <a href="#about" className="btn btn-outline glass btn-lg">Learn More</a>
                </div>
            </div>
        </div>
    );
};

export default Hero;
