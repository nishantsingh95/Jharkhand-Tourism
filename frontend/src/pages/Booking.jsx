import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadDestinationByIdWithCache } from '../utils/offlineDestinations';
import { resolveApiUrl } from '../utils/apiBase';
import { Viewer } from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
import './Booking.css';
import './Destinations.css';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState(null);
    const [user, setUser] = useState(null);
    const [show360, setShow360] = useState(false);
    const viewerContainerRef = useRef(null);
    const viewerInstanceRef = useRef(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', location: '', category: '', bestTimeToVisit: '', exploreTime: '' });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // When the edit modal opens, default the preview to the existing destination image.
    useEffect(() => {
        if (showEditModal && destination) {
            setEditImageFile(null);
            setEditImagePreview(destination.image || null);
        }
    }, [showEditModal, destination]);

    const fallbackDestinations = [
        { name: "Netarhat", description: "Known as the 'Queen of Chotanagpur', Netarhat is a pristine hill station famous for its glorious sunrises and sunsets through the dense pine forests.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg/960px-Pine_trees_of_Netarhat_Hill_station.jpg", location: "Latehar District", pricePerNight: 2500, rating: 4.8, exploreTime: "2-3 Days", bestTimeToVisit: "October to March" },
        { name: "Deoghar Baidyanath Temple", description: "A major Hindu pilgrimage center featuring the famous Baidyanath Jyotirlinga, drawing millions of pilgrims focusing on serene spirituality.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Baba_Baidyanath_Jyotirlinga_Temple.jpg/960px-Baba_Baidyanath_Jyotirlinga_Temple.jpg", location: "Deoghar District", pricePerNight: 1500, rating: 4.6, exploreTime: "1-2 Days", bestTimeToVisit: "July to August (Shravan month) or October to March" },
        { name: "Betla National Park", description: "A beautiful national park offering safaris, elephants, and wildlife viewing amidst dense Sal and Bamboo forests. One of India's first tiger reserves.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Betla_national_park.jpg/960px-Entrance_of_Betla_national_park.jpg", location: "Palamu District", pricePerNight: 3000, rating: 4.9, exploreTime: "1-2 Days", bestTimeToVisit: "November to April" },
        { name: "Dassam Falls", description: "A breathtaking waterfall where the Kanchi River falls from a height of 144 feet, creating a spectacular view and natural pool.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/960px-Dassam_falls.jpg", location: "Ranchi", pricePerNight: 1200, rating: 4.5, exploreTime: "3-4 Hours", bestTimeToVisit: "August to December" },
        { name: "Patratu Valley", description: "Famous for its winding roads and the spectacular Patratu Dam. It offers breathtaking panoramic views of lush green valleys.", image: "https://picsum.photos/seed/Patratu_Valley/800/500", location: "Ramgarh District", pricePerNight: 2000, rating: 4.7, exploreTime: "1 Day", bestTimeToVisit: "October to March" },
        { name: "Hundru Falls", description: "One of the most famous tourist places in Ranchi. The Subarnarekha River falls from a height of 320 feet making it the 34th highest waterfall in India.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg/960px-Hundru_Falls%2C_Jharkhand%2C_India_4.jpg", location: "Ranchi", pricePerNight: 1800, rating: 4.7, exploreTime: "3-4 Hours", bestTimeToVisit: "August to December" },
        { name: "Shikharji (Parasnath Hill)", description: "The highest mountain peak in Jharkhand. It is the most important Jain Tirtha (pilgrimage site) where twenty of the twenty-four Tirthankaras attained salvation.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Shikharji_Parasnath_Giridih.jpg/960px-Shikharji_Parasnath_Giridih.jpg", location: "Giridih District", pricePerNight: 1000, rating: 4.9, exploreTime: "1-2 Days", bestTimeToVisit: "October to March" },
        { name: "Jubilee Park", description: "A sprawling 225-acre park in the heart of Tatanagar, inspired by the Vrindavan Gardens. Features beautiful fountains, a zoo, and scenic lakes.", image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Jublie_Park_Night_on_March.jpg", location: "Jamshedpur", pricePerNight: 2800, rating: 4.6, exploreTime: "Half Day", bestTimeToVisit: "October to March" },
        { name: "Jonha Falls", description: "Also known as Gautam Dhara, this spectacular waterfall is surrounded by dense forests and requires descending 722 steps to witness its full glory.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Jonha_falls.jpg/960px-Jonha_falls.jpg", location: "Ranchi", pricePerNight: 1400, rating: 4.5, exploreTime: "3-4 Hours", bestTimeToVisit: "August to December" },
        { name: "Dalma Wildlife Sanctuary", description: "Famous for its population of Asian Elephants, Barking Deer, and Sloth Bears. Located on the Dalma Hills overlooking Jamshedpur.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Wild_Abode.jpg/960px-Wild_Abode.jpg", location: "Jamshedpur", pricePerNight: 2200, rating: 4.4, exploreTime: "1 Day", bestTimeToVisit: "October to March" },
        { name: "Rajrappa Temple", description: "An ancient shakti peeth dedicated to Goddess Chinnamasta, situated at the confluence of the Bhairavi and Damodar rivers.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Maa_Chhinnamasta_Temple.jpg/960px-Maa_Chhinnamasta_Temple.jpg", location: "Ramgarh", pricePerNight: 900, rating: 4.8, exploreTime: "Half Day", bestTimeToVisit: "October to March" },
        { name: "Tagore Hill", description: "Named after Rabindranath Tagore whose elder brother stayed here. Offers a panoramic green view of Ranchi city.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Tagore_hill_Ranchi.jpg/960px-Tagore_hill_Ranchi.jpg", location: "Ranchi", pricePerNight: 1100, rating: 4.3, exploreTime: "2-3 Hours", bestTimeToVisit: "October to March" },
        { name: "Lodh Falls", description: "The highest waterfall in Jharkhand and 21st highest in India. It is situated deep within the burhaghagh river forest.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lodh_Fall.png/960px-Lodh_Fall.png", location: "Latehar", pricePerNight: 1600, rating: 4.7, exploreTime: "Half Day", bestTimeToVisit: "August to December" },
        { name: "Hazaribagh National Park", description: "A sanctuary of scenic beauty and rich biodiversity nesting in low hilly terrain with wildlife including nilgai, chital, and panther.", image: "https://picsum.photos/seed/Hazaribagh_National_Park/800/500", location: "Hazaribagh", pricePerNight: 2400, rating: 4.5, exploreTime: "1-2 Days", bestTimeToVisit: "October to March" },
        { name: "Maithon Dam", description: "Located on the Barakar River, this massive dam features an underground power station. Known for boating and enjoying stunning sunsets.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Maithon_dam%2C_india.jpg/960px-Maithon_dam%2C_india.jpg", location: "Dhanbad", pricePerNight: 1700, rating: 4.6, exploreTime: "Half Day", bestTimeToVisit: "October to March" },
        { name: "Mcluskieganj", description: "A small town famously founded by the Anglo-Indian community in the 1930s. Known for its European architecture, serene environment, and dense forests.", image: "https://picsum.photos/seed/Mcluskieganj/800/500", location: "Ranchi District", pricePerNight: 1500, rating: 4.4, exploreTime: "1-2 Days", bestTimeToVisit: "October to March" },
        { name: "Massanjore Dam", description: "A picturesque dam located on the Mayurakshi River. Offers scenic beauty, boating facilities, and a peaceful environment.", image: "https://picsum.photos/seed/Massanjore/800/500", location: "Dumka", pricePerNight: 1200, rating: 4.5, exploreTime: "Half Day", bestTimeToVisit: "August to February" },
        { name: "Khandoli Park", description: "A scenic water reservoir and park area at the foot of Khandoli Hill. A paradise for bird watchers and adventure sports lovers.", image: "https://picsum.photos/seed/Khandoli/800/500", location: "Giridih", pricePerNight: 800, rating: 4.3, exploreTime: "Half Day", bestTimeToVisit: "November to March" },
        { name: "Trikut Pahar", description: "Famous for its three main peaks and a beautiful ropeway. A prominent Hindu pilgrimage and tourist spot near Deoghar.", image: "https://picsum.photos/seed/Trikut/800/500", location: "Deoghar", pricePerNight: 1100, rating: 4.6, exploreTime: "Half Day", bestTimeToVisit: "October to March" },
        { name: "Ghatshila", description: "A charming town located on the banks of the Subarnarekha River, famous for its scenic beauty, waterfalls, and association with Bengali literature.", image: "https://picsum.photos/seed/Ghatshila/800/500", location: "East Singhbhum", pricePerNight: 1800, rating: 4.5, exploreTime: "1-2 Days", bestTimeToVisit: "October to March" },
        { name: "Dimna Lake", description: "An artificial lake situated at the foothills of Dalma mountain range. A perfect spot for picnics, boating, and enjoying nature.", image: "https://picsum.photos/seed/DimnaLake/800/500", location: "Jamshedpur", pricePerNight: 2000, rating: 4.6, exploreTime: "3-4 Hours", bestTimeToVisit: "November to February" }
    ].map((d, i) => ({ ...d, _id: `fallback-${i}`, id: `fallback-${i}` }));

    useEffect(() => {
        if (!id) return;
        if (id.startsWith('fallback')) {
            const index = parseInt(id.split('-')[1]);
            if (!isNaN(index) && fallbackDestinations[index]) {
                setDestination(fallbackDestinations[index]);
                return;
            }
        }

        let cancelled = false;
        loadDestinationByIdWithCache(id).then(({ data }) => {
            if (cancelled) return;
            if (data && data.name) {
                setDestination(data);
                return;
            }
            const fromFallback = fallbackDestinations.find(d => d._id === id);
            if (fromFallback) setDestination(fromFallback);
        });
        return () => { cancelled = true; };
    }, [id]);

    const panoramaUrl = useMemo(() => {
        // For now we use the destination image as the panorama.
        // If you later add a dedicated 360 image field (e.g. `image360`), use it here.
        return destination?.image || '';
    }, [destination]);

    useEffect(() => {
        // Toggle 360 viewer.
        if (!show360) {
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.destroy();
                viewerInstanceRef.current = null;
            }
            return;
        }

        if (!panoramaUrl || !viewerContainerRef.current) return;

        if (viewerInstanceRef.current) {
            viewerInstanceRef.current.destroy();
            viewerInstanceRef.current = null;
        }

        try {
            viewerInstanceRef.current = new Viewer({
                container: viewerContainerRef.current,
                panorama: panoramaUrl,
                defaultZoomLvl: 0.5,
                lang: 'en',
                caption: destination?.name || '',
                mousewheel: true,
                navbar: true
            });
        } catch (e) {
            console.warn('360 viewer init failed:', e);
            setShow360(false);
        }

        return () => {
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.destroy();
                viewerInstanceRef.current = null;
            }
        };
    }, [show360, panoramaUrl, destination?.name]);


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

    let processedImage = destination.image || 'https://picsum.photos/seed/travel/800/500';
    if (processedImage.includes('localhost')) {
        const apiUrl = resolveApiUrl();
        processedImage = processedImage.replace(/http:\/\/localhost:\d+/i, apiUrl);
    }

    return (
        <div className="booking-page container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <div className="booking-layout">
                <div className="booking-details">
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className={`btn ${!show360 ? 'btn-primary' : 'btn-accent'}`}
                            type="button"
                            onClick={() => setShow360(false)}
                            style={{ padding: '0.6rem 1.2rem' }}
                        >
                            Photo
                        </button>
                        <button
                            className={`btn ${show360 ? 'btn-primary' : 'btn-accent'}`}
                            type="button"
                            onClick={() => setShow360(true)}
                            style={{ padding: '0.6rem 1.2rem' }}
                        >
                            360° View
                        </button>
                    </div>

                    {!show360 ? (
                        <img 
                            src={processedImage} 
                            alt={destination.name} 
                            className="booking-image" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://picsum.photos/seed/Jharkhand/800/500'; }}
                        />
                    ) : (
                        <div ref={viewerContainerRef} className="booking-360-view" />
                    )}
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

                        {user && user.role === 'admin' && (
                            <div className="admin-action-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <button
                                    className="btn admin-edit-btn"
                                    style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => { setEditForm({ name: destination.name || '', description: destination.description || '', location: destination.location || '', category: destination.category || '', bestTimeToVisit: destination.bestTimeToVisit || '', exploreTime: destination.exploreTime || '' }); setShowEditModal(true); }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn admin-delete-btn"
                                    style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={async () => { 
                                        if (window.confirm(`Are you sure you want to delete "${destination.name}"?`)) { 
                                            try {
                                                const apiUrl = resolveApiUrl();
                                                const res = await fetch(`${apiUrl}/api/destinations/${destination._id}`, {
                                                    method: 'DELETE'
                                                });
                                                if (!res.ok) {
                                                    const errData = await res.json().catch(() => ({}));
                                                    throw new Error(errData.message || 'Failed to delete destination');
                                                }
                                                navigate('/destinations'); 
                                            } catch (error) {
                                                alert(error.message);
                                            }
                                        } 
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Edit Modal */}
            {showEditModal && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => {
                        if (editImagePreview && editImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(editImagePreview);
                        }
                        setEditImageFile(null);
                        setEditImagePreview(null);
                        setShowEditModal(false);
                    }}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div className="admin-modal glass-card" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '90%', maxWidth: '520px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>✏️ Edit Destination</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Modify the details for <strong>{destination.name}</strong></p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Category</label>
                            <select
                                value={editForm.category}
                                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                            >
                                <option value="">Select category</option>
                                <option value="Waterfalls">Waterfalls</option>
                                <option value="Wildlife">Wildlife</option>
                                <option value="Temples">Temples</option>
                                <option value="Hills & Views">Hills & Views</option>
                            </select>
                        </div>

                        {['name', 'location', 'exploreTime', 'bestTimeToVisit'].map(field => (
                            <div key={field} style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'capitalize', fontSize: '0.85rem', color: '#374151' }}>{field.replace(/([A-Z])/g, ' $1')}</label>
                                <input
                                    type="text"
                                    value={editForm[field]}
                                    onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        ))}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', minHeight: '100px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                    setEditImageFile(file);

                                    if (!file) {
                                        if (editImagePreview && editImagePreview.startsWith('blob:')) {
                                            URL.revokeObjectURL(editImagePreview);
                                        }
                                        setEditImagePreview(destination.image || null);
                                        return;
                                    }

                                    const url = URL.createObjectURL(file);
                                    setEditImagePreview(prev => {
                                        if (prev && prev.startsWith('blob:')) {
                                            URL.revokeObjectURL(prev);
                                        }
                                        return url;
                                    });
                                }}
                                style={{ width: '100%' }}
                            />

                            {editImagePreview && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <img
                                        src={editImagePreview}
                                        alt="Edit preview"
                                        style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    if (editImagePreview && editImagePreview.startsWith('blob:')) {
                                        URL.revokeObjectURL(editImagePreview);
                                    }
                                    setEditImageFile(null);
                                    setEditImagePreview(null);
                                    setShowEditModal(false);
                                }}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Save logic goes here. Connect to your backend API with editForm data.');
                                    console.log({ ...editForm, photoFile: editImageFile });
                                    if (editImagePreview && editImagePreview.startsWith('blob:')) {
                                        URL.revokeObjectURL(editImagePreview);
                                    }
                                    setEditImageFile(null);
                                    setEditImagePreview(null);
                                    setShowEditModal(false);
                                }}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                            >
                                💾 Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;
