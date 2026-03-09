import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([
        {
            _id: 'default1',
            name: 'Netarhat',
            location: 'Latehar District',
            description: "Known as the 'Queen of Chotanagpur', Netarhat is a pristine hill station famous for its sunrise and sunset views.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg',
            rating: 4.8
        },
        {
            _id: 'default2',
            name: 'Deoghar Baidyanath Temple',
            location: 'Deoghar District',
            description: "A major Hindu pilgrimage center featuring the famous Baidyanath Jyotirlinga, drawing millions of devotees.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Baidyanath_Temple_Deoghar.jpg',
            rating: 4.6
        },
        {
            _id: 'default3',
            name: 'Betla National Park',
            location: 'Palamu District',
            description: "A beautiful national park offering safaris, elephants, and wildlife viewing amidst dense forests.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Betla_National_Park_Gate.jpg',
            rating: 4.9
        }
    ]);

    useEffect(() => {
        const rawUrl = import.meta.env.VITE_API_URL?.trim();
        const isProduction = !window.location.hostname.includes('localhost');
        const apiUrl = (rawUrl && (!rawUrl.includes('localhost') || !isProduction))
            ? rawUrl
            : (isProduction ? window.location.origin : 'http://localhost:5000');

        fetch(`${apiUrl}/api/destinations`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setFeatured(data.slice(0, 3));
                }
            })
            .catch(err => console.error("Error fetching destinations, using defaults", err));
    }, []);

    return (
        <div className="home-page">
            <Hero />

            <section className="container px-4 famous-section">
                <div className="famous-header text-center" style={{ textAlign: 'center' }}>
                    <h2>Pride of <span style={{ color: 'var(--accent)' }}>Jharkhand</span></h2>
                    <p style={{ margin: '0 auto', color: 'var(--text-light)', maxWidth: '600px', fontSize: '1.1rem' }}>Discover the legends, heritage, and industrial marvels born in the land of forests.</p>
                </div>

                <div className="famous-grid">
                    <div className="famous-card glass-card">
                        <div className="famous-icon">🏏</div>
                        <h3>M.S. Dhoni</h3>
                        <p>The legendary former captain of the Indian Cricket Team hails from Ranchi. His unparalleled legacy inspires millions.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <div className="famous-icon">🏭</div>
                        <h3>TATA Steel</h3>
                        <p>Jamshedpur, India's first planned industrial city, is home to Tata Steel, driving the nation's infrastructural boom.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <div className="famous-icon">🐅</div>
                        <h3>Betla & Dalma</h3>
                        <p>World-class wildlife reserves offering pristine tiger trails, majestic elephants, and untouched biodiversity.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <div className="famous-icon">🎨</div>
                        <h3>Sohrai Art</h3>
                        <p>Ancient tribal mural paintings found on the mud walls of traditional houses, depicting nature and harvest.</p>
                    </div>
                </div>
            </section>

            <section id="about" className="section-about container" style={{ marginTop: '5rem' }}>
                <div className="about-content">
                    <h2>Why Visit Jharkhand?</h2>
                    <p>Often referred to as the "Land of Forests", Jharkhand offers an unparalleled blend of nature, wildlife, and indigenous culture. Revitalize your spirit with our sustainable tourism initiatives designed to create seamless, personalized journeys while supporting local communities.</p>
                    <div className="stats-grid">
                        <div className="stat-box glass-card">
                            <h3>24+</h3>
                            <p>Waterfalls</p>
                        </div>
                        <div className="stat-box glass-card">
                            <h3>11</h3>
                            <p>Wildlife Sanctuaries</p>
                        </div>
                        <div className="stat-box glass-card">
                            <h3>32</h3>
                            <p>Tribal Communities</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-featured bg-light">
                <div className="container">
                    <div className="section-header">
                        <h2>Trending Destinations</h2>
                        <p>Discover the most loved spots by travelers</p>
                    </div>
                    <div className="destinations-grid">
                        {featured.map(dest => (
                            <DestinationCard key={dest._id} destination={dest} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
