import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import { loadDestinationsWithCache } from '../utils/offlineDestinations';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([
        {
            _id: 'default1',
            name: 'Netarhat',
            location: 'Latehar District',
            description: "Known as the 'Queen of Chotanagpur', Netarhat is a pristine hill station famous for its glorious sunrises and sunsets through the dense pine forests.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg/960px-Pine_trees_of_Netarhat_Hill_station.jpg',
            rating: 4.8
        },
        {
            _id: 'default2',
            name: 'Deoghar Baidyanath Temple',
            location: 'Deoghar District',
            description: "A major Hindu pilgrimage center featuring the famous Baidyanath Jyotirlinga, drawing millions of pilgrims focusing on serene spirituality.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Baba_Baidyanath_Jyotirlinga_Temple.jpg/960px-Baba_Baidyanath_Jyotirlinga_Temple.jpg',
            rating: 4.6
        },
        {
            _id: 'default3',
            name: 'Betla National Park',
            location: 'Palamu District',
            description: "A beautiful national park offering safaris, elephants, and wildlife viewing amidst dense Sal and Bamboo forests. One of India's first tiger reserves.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Betla_national_park.jpg/960px-Entrance_of_Betla_national_park.jpg',
            rating: 4.9
        },
        {
            _id: 'default4',
            name: 'Dassam Falls',
            location: 'Ranchi',
            description: "A breathtaking waterfall where the Kanchi River falls from a height of 144 feet, creating a spectacular view and natural pool.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/960px-Dassam_falls.jpg',
            rating: 4.5
        },
        {
            _id: 'default5',
            name: 'Patratu Valley',
            location: 'Ramgarh District',
            description: "Famous for its winding roads and the spectacular Patratu Dam. It offers breathtaking panoramic views of lush green valleys.",
            image: 'https://picsum.photos/seed/Patratu_Valley/800/500',
            rating: 4.7
        },
        {
            _id: 'default6',
            name: 'Hundru Falls',
            location: 'Ranchi',
            description: "One of the most famous tourist places in Ranchi. The Subarnarekha River falls from a height of 320 feet making it the 34th highest waterfall in India.",
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg/960px-Hundru_Falls%2C_Jharkhand%2C_India_4.jpg',
            rating: 4.7
        }
    ]);

    useEffect(() => {
        loadDestinationsWithCache().then(({ data }) => {
            if (data && data.length > 0) {
                setFeatured(data);
            }
        });
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
                        <img
                            className="famous-image"
                            src="https://i.pinimg.com/originals/48/b3/08/48b3080067ea70c1be144d67251452ba.jpg"
                            alt="M.S. Dhoni"
                        />
                        <h3>M.S. Dhoni</h3>
                        <p>The legendary former captain of the Indian Cricket Team hails from Ranchi. His unparalleled legacy inspires millions.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://media.glassdoor.com/l/9a/31/d8/44/steel-plant.jpg"
                            alt="Tata Steel"
                        />
                        <h3>TATA Steel</h3>
                        <p>Jamshedpur, India's first planned industrial city, is home to Tata Steel, driving the nation's infrastructural boom.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://tse1.mm.bing.net/th/id/OIP.WaP8tf9kBkm3d0pM277OUwHaEK?pid=Api&P=0&h=180"
                            alt="Betla & Dalma"
                        />
                        <h3>Betla & Dalma</h3>
                        <p>World-class wildlife reserves offering pristine tiger trails, majestic elephants, and untouched biodiversity.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://i.pinimg.com/originals/08/95/38/089538756e47605c5b6c632b13cf8dbe.jpg"
                            alt="Sohrai Art"
                        />
                        <h3>Sohrai Art</h3>
                        <p>Ancient tribal mural paintings found on the mud walls of traditional houses, depicting nature and harvest.</p>
                    </div>
                </div>
            </section>

            <section className="container px-4 famous-section" style={{ paddingTop: '2rem' }}>
                <div className="famous-header text-center" style={{ textAlign: 'center' }}>
                    <h2>Educational <span style={{ color: 'var(--accent)' }}>Excellence</span></h2>
                    <p style={{ margin: '0 auto', color: 'var(--text-light)', maxWidth: '600px', fontSize: '1.1rem' }}>Home to some of India's most prestigious and historic institutions.</p>
                </div>

                <div className="famous-grid">
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://tse1.mm.bing.net/th/id/OIP.11TC4AOwlk8uVu290YhpjAHaCV?pid=Api&P=0&h=180"
                            alt="IIT (ISM) Dhanbad"
                        />
                        <h3>IIT (ISM) Dhanbad</h3>
                        <p>Established in 1926, a premier engineering institute world-renowned for Earth Sciences and Mining Engineering.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="/xlri.png"
                            alt="XLRI Jamshedpur"
                        />
                        <h3>XLRI Jamshedpur</h3>
                        <p>India's oldest business school, consistently ranked among the top management institutes in the country.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://tse4.mm.bing.net/th/id/OIP.xyr0hsgy5ybMSueZvrvTQwHaD2?pid=Api&P=0&h=180"
                            alt="BIT Mesra"
                        />
                        <h3>BIT Mesra</h3>
                        <p>A pioneering institute in engineering and technology, boasting lush green campuses and top-tier research facilities.</p>
                    </div>
                    <div className="famous-card glass-card">
                        <img
                            className="famous-image"
                            src="https://tse1.mm.bing.net/th/id/OIP.g5v4aNBVX3WqAdoQCOmawgHaCm?pid=Api&P=0&h=180"
                            alt="RIMS Ranchi"
                        />
                        <h3>RIMS Ranchi</h3>
                        <p>The premier medical college and hospital of Jharkhand, providing world-class healthcare education and services.</p>
                    </div>
                </div>
            </section>

            <section className="section-featured bg-light" style={{ padding: '6rem 0' }}>
                <div className="container px-4">
                    <div className="famous-header text-center" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <h2 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                            Vibrant <span style={{ color: 'var(--accent)' }}>Culture</span>
                        </h2>
                        <p style={{ margin: '0 auto', color: 'var(--text-light)', maxWidth: '600px', fontSize: '1.1rem' }}>Immerse yourself in the soulful traditions, art, and festivals of Jharkhand.</p>
                    </div>

                    <div className="famous-grid">
                        <div className="famous-card glass-card" style={{ background: 'white' }}>
                            <img
                                className="famous-image"
                                src="https://c8.alamy.com/comp/2KCYERN/artists-from-jharkhand-region-perform-traditional-manbhum-chhau-dance-during-the-closing-of-lokrang-festival-at-jkk-in-jaipur-rajasthan-indiaon-saturday-night-dec-252021photo-by-vishal-bhatnagarnurphoto-2KCYERN.jpg"
                                alt="Chhau Dance"
                            />
                            <h3>Chhau Dance</h3>
                            <p>A mesmerizing semi-classical martial dance using vibrant masks, celebrating mythology and folklore.</p>
                        </div>
                        <div className="famous-card glass-card" style={{ background: 'white' }}>
                            <img
                                className="famous-image"
                                src="https://tse1.mm.bing.net/th/id/OIP.yvxMknkInOjTca9qegvhyAHaE8?pid=Api&P=0&h=180"
                                alt="Sarhul Festival"
                            />
                            <h3>Sarhul Festival</h3>
                            <p>The largest tribal festival celebrating the spring season and the worship of the majestic Sal trees.</p>
                        </div>
                        <div className="famous-card glass-card" style={{ background: 'white' }}>
                            <img
                                className="famous-image"
                                src="https://www.vifindia.org/sites/default/files/maatighar.jpg"
                                alt="Sohrai Art"
                            />
                            <h3>Sohrai Art</h3>
                            <p>Traditional ritualistic mural paintings created by women to welcome the harvest and celebrate nature.</p>
                        </div>
                        <div className="famous-card glass-card" style={{ background: 'white' }}>
                            <img
                                className="famous-image"
                                src="https://tse4.mm.bing.net/th/id/OIP.51h60Wbh4T2ZaZ3zJ4PgeQHaFj?pid=Api&P=0&h=180"
                                alt="Mandar Rhythms"
                            />
                            <h3>Mandar Rhythms</h3>
                            <p>The heartbeat of local festivals, this traditional tribal drum brings the community together in joyous harmony.</p>
                        </div>
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
                        {featured.slice(0, 3).map(dest => (
                            <DestinationCard key={dest._id} destination={dest} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
