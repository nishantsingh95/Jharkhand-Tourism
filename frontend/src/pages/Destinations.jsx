import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationCard from '../components/DestinationCard';
import { loadDestinationsWithCache } from '../utils/offlineDestinations';
import { resolveApiUrl } from '../utils/apiBase';
import { setCachedDestinations } from '../utils/destinationsCache';
import './Destinations.css';

// Using CDN links for Leaflet marker assets to bypass Vite/Rollup bundling issues
const mapIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const coordinatesMap = {
    "Netarhat": [23.4796, 84.2690],
    "Dassam Falls": [23.2104, 85.5582],
    "Betla National Park": [23.8828, 84.1915],
    "Deoghar Baidyanath Temple": [24.4925, 86.6997],
    "Hundru Falls": [23.4475, 85.6548],
    "Jonha Falls": [23.3644, 85.6262],
    "Patratu Valley": [23.6333, 85.2833],
    "Dalma Wildlife Sanctuary": [22.9056, 86.2081],
    "Shikharji": [23.9515, 86.1362],
    "Jubilee Park": [22.8122, 86.1851],
    "Ranchi": [23.3441, 85.3096],
    "Mcluskieganj": [23.5786, 84.9774],
    "Massanjore Dam": [24.1018, 87.3113],
    "Khandoli Park": [24.2307, 86.3312],
    "Trikut Pahar": [24.4950, 86.8290],
    "Ghatshila": [22.5768, 86.4800],
    "Dimna Lake": [22.8465, 86.2307],
    "Rajrappa": [23.6262, 85.7088],
    "Tagore Hill": [23.3888, 85.3283],
    "Lodh Falls": [23.6062, 84.0505],
    "Hazaribagh National Park": [24.0620, 85.3400],
    "Maithon Dam": [23.7853, 86.8115]
};

const Destinations = () => {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All Places');
    const [user, setUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        description: '',
        location: '',
        category: '',
        exploreTime: '',
        bestTimeToVisit: '',
        rating: '4.5'
    });
    const [addImageFile, setAddImageFile] = useState(null);
    const [addImagePreview, setAddImagePreview] = useState(null);
    const [addingDestination, setAddingDestination] = useState(false);

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerLayerRef = useRef(null);

    const filters = ['All Places', 'Waterfalls', 'Wildlife', 'Temples', 'Hills & Views'];
    const categoryOptions = ['Waterfalls', 'Wildlife', 'Temples', 'Hills & Views'];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const fallbackData = [
        { name: "Netarhat", description: "Known as the 'Queen of Chotanagpur', Netarhat is a pristine hill station famous for its glorious sunrises and sunsets through the dense pine forests.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg/960px-Pine_trees_of_Netarhat_Hill_station.jpg", location: "Latehar District", pricePerNight: 2500, rating: 4.8 },
        { name: "Deoghar Baidyanath Temple", description: "A major Hindu pilgrimage center featuring the famous Baidyanath Jyotirlinga, drawing millions of pilgrims focusing on serene spirituality.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Baba_Baidyanath_Jyotirlinga_Temple.jpg/960px-Baba_Baidyanath_Jyotirlinga_Temple.jpg", location: "Deoghar District", pricePerNight: 1500, rating: 4.6 },
        { name: "Betla National Park", description: "A beautiful national park offering safaris, elephants, and wildlife viewing amidst dense Sal and Bamboo forests. One of India's first tiger reserves.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Betla_national_park.jpg/960px-Entrance_of_Betla_national_park.jpg", location: "Palamu District", pricePerNight: 3000, rating: 4.9 },
        { name: "Dassam Falls", description: "A breathtaking waterfall where the Kanchi River falls from a height of 144 feet, creating a spectacular view and natural pool.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/960px-Dassam_falls.jpg", location: "Ranchi", pricePerNight: 1200, rating: 4.5 },
        { name: "Patratu Valley", description: "Famous for its winding roads and the spectacular Patratu Dam. It offers breathtaking panoramic views of lush green valleys.", image: "https://picsum.photos/seed/Patratu_Valley/800/500", location: "Ramgarh District", pricePerNight: 2000, rating: 4.7 },
        { name: "Hundru Falls", description: "One of the most famous tourist places in Ranchi. The Subarnarekha River falls from a height of 320 feet making it the 34th highest waterfall in India.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg/960px-Hundru_Falls%2C_Jharkhand%2C_India_4.jpg", location: "Ranchi", pricePerNight: 1800, rating: 4.7 },
        { name: "Shikharji (Parasnath Hill)", description: "The highest mountain peak in Jharkhand. It is the most important Jain Tirtha (pilgrimage site) where twenty of the twenty-four Tirthankaras attained salvation.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Shikharji_Parasnath_Giridih.jpg/960px-Shikharji_Parasnath_Giridih.jpg", location: "Giridih District", pricePerNight: 1000, rating: 4.9 },
        { name: "Jubilee Park", description: "A sprawling 225-acre park in the heart of Tatanagar, inspired by the Vrindavan Gardens. Features beautiful fountains, a zoo, and scenic lakes.", image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Jublie_Park_Night_on_March.jpg", location: "Jamshedpur", pricePerNight: 2800, rating: 4.6 },
        { name: "Jonha Falls", description: "Also known as Gautam Dhara, this spectacular waterfall is surrounded by dense forests and requires descending 722 steps to witness its full glory.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Jonha_falls.jpg/960px-Jonha_falls.jpg", location: "Ranchi", pricePerNight: 1400, rating: 4.5 },
        { name: "Dalma Wildlife Sanctuary", description: "Famous for its population of Asian Elephants, Barking Deer, and Sloth Bears. Located on the Dalma Hills overlooking Jamshedpur.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Wild_Abode.jpg/960px-Wild_Abode.jpg", location: "Jamshedpur", pricePerNight: 2200, rating: 4.4 },
        { name: "Rajrappa Temple", description: "An ancient shakti peeth dedicated to Goddess Chinnamasta, situated at the confluence of the Bhairavi and Damodar rivers.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Maa_Chhinnamasta_Temple.jpg/960px-Maa_Chhinnamasta_Temple.jpg", location: "Ramgarh", pricePerNight: 900, rating: 4.8 },
        { name: "Tagore Hill", description: "Named after Rabindranath Tagore whose elder brother stayed here. Offers a panoramic green view of Ranchi city.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Tagore_hill_Ranchi.jpg/960px-Tagore_hill_Ranchi.jpg", location: "Ranchi", pricePerNight: 1100, rating: 4.3 },
        { name: "Lodh Falls", description: "The highest waterfall in Jharkhand and 21st highest in India. It is situated deep within the burhaghagh river forest.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lodh_Fall.png/960px-Lodh_Fall.png", location: "Latehar", pricePerNight: 1600, rating: 4.7 },
        { name: "Hazaribagh National Park", description: "A sanctuary of scenic beauty and rich biodiversity nesting in low hilly terrain with wildlife including nilgai, chital, and panther.", image: "https://picsum.photos/seed/Hazaribagh_National_Park/800/500", location: "Hazaribagh", pricePerNight: 2400, rating: 4.5 },
        { name: "Maithon Dam", description: "Located on the Barakar River, this massive dam features an underground power station. Known for boating and enjoying stunning sunsets.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Maithon_dam%2C_india.jpg/960px-Maithon_dam%2C_india.jpg", location: "Dhanbad", pricePerNight: 1700, rating: 4.6 },
        { name: "Mcluskieganj", description: "A small town famously founded by the Anglo-Indian community in the 1930s. Known for its European architecture, serene environment, and dense forests.", image: "https://picsum.photos/seed/Mcluskieganj/800/500", location: "Ranchi District", pricePerNight: 1500, rating: 4.4 },
        { name: "Massanjore Dam", description: "A picturesque dam located on the Mayurakshi River. Offers scenic beauty, boating facilities, and a peaceful environment.", image: "https://picsum.photos/seed/Massanjore/800/500", location: "Dumka", pricePerNight: 1200, rating: 4.5 },
        { name: "Khandoli Park", description: "A scenic water reservoir and park area at the foot of Khandoli Hill. A paradise for bird watchers and adventure sports lovers.", image: "https://picsum.photos/seed/Khandoli/800/500", location: "Giridih", pricePerNight: 800, rating: 4.3 },
        { name: "Trikut Pahar", description: "Famous for its three main peaks and a beautiful ropeway. A prominent Hindu pilgrimage and tourist spot near Deoghar.", image: "https://picsum.photos/seed/Trikut/800/500", location: "Deoghar", pricePerNight: 1100, rating: 4.6 },
        { name: "Ghatshila", description: "A charming town located on the banks of the Subarnarekha River, famous for its scenic beauty, waterfalls, and association with Bengali literature.", image: "https://picsum.photos/seed/Ghatshila/800/500", location: "East Singhbhum", pricePerNight: 1800, rating: 4.5 },
        { name: "Dimna Lake", description: "An artificial lake situated at the foothills of Dalma mountain range. A perfect spot for picnics, boating, and enjoying nature.", image: "https://picsum.photos/seed/DimnaLake/800/500", location: "Jamshedpur", pricePerNight: 2000, rating: 4.6 }
    ].map((d, i) => ({ ...d, _id: `fallback-${i}` }));

    useEffect(() => {
        let cancelled = false;
        loadDestinationsWithCache().then(({ data, source }) => {
            if (cancelled) return;
            if (data && data.length > 0) {
                setDestinations(data);
                setDataSource(source);
            } else {
                setDestinations(fallbackData);
                setDataSource('fallback');
            }
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);


    const getFiltered = () => {
        if (activeFilter === 'All Places') return destinations;

        return destinations.filter(d => {
            const destCategory = (d.category || '').toString().trim();
            if (destCategory) {
                // When admin saved a category, trust it for accurate filtering.
                return destCategory.toLowerCase() === activeFilter.toLowerCase();
            }

            const name = (d.name || d.title || '').toLowerCase();
            if (activeFilter === 'Waterfalls') return name.includes('fall');
            if (activeFilter === 'Wildlife') return name.includes('park') || name.includes('sanctuary') || name.includes('betla') || name.includes('dalma');
            if (activeFilter === 'Temples') return name.includes('temple') || name.includes('shikharji') || name.includes('mandir');
            if (activeFilter === 'Hills & Views') return name.includes('hill') || name.includes('valley') || name.includes('dam') || name.includes('netarhat');
            return true;
        });
    };

    const filteredDestinations = getFiltered();

    const getCoords = (name) => {
        for (const [key, coords] of Object.entries(coordinatesMap)) {
            if (name.includes(key)) return coords;
        }
        return [23.3441 + (Math.random() - 0.5) * 0.5, 85.3096 + (Math.random() - 0.5) * 0.5];
    };

    // Native Leaflet Initialization
    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstance.current) {
            // Initialize map only once
            mapInstance.current = L.map(mapRef.current).setView([23.6333, 85.2833], 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance.current);
        }

        return () => {
            // Cleanup on unmount
            if (mapInstance.current) {
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Effect for updating markers dynamically when filteredDestinations changes
    useEffect(() => {
        if (!mapInstance.current) return;

        // Remove old marker layer if it exists
        if (markerLayerRef.current) {
            mapInstance.current.removeLayer(markerLayerRef.current);
        }

        // Create new feature group for current filtered markers
        markerLayerRef.current = L.featureGroup().addTo(mapInstance.current);

        filteredDestinations.forEach(dest => {
            const name = dest.name || dest.title || 'Unknown Location';
            const [lat, lng] = getCoords(name);

            const popupContent = `
                <div style="width: 200px; font-family: 'Inter', sans-serif;">
                    <img src="${dest.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg/960px-Pine_trees_of_Netarhat_Hill_station.jpg'}" alt="${name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                    <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: #10b981;">${name}</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #666;">${dest.description ? dest.description.substring(0, 50) : ''}...</p>
                </div>
            `;

            L.marker([lat, lng], { icon: mapIcon })
                .bindPopup(popupContent)
                .addTo(markerLayerRef.current);
        });

        // Optional: auto-fit bounds if we have markers
        if (filteredDestinations.length > 0 && markerLayerRef.current.getLayers().length > 0) {
            const bounds = markerLayerRef.current.getBounds();
            mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }

    }, [filteredDestinations]);

    return (
        <div className="destinations-page-layout">
            <div className="map-column">
                <div style={{ height: "100%", width: "100%", borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    {/* The native map container */}
                    <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
                </div>
            </div>

            <div className="content-column">
                {dataSource === 'cache' && (
                    <p style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-light)',
                        marginBottom: '1rem',
                        padding: '0.65rem 1rem',
                        background: 'rgba(15, 118, 110, 0.08)',
                        borderRadius: '12px',
                    }}>
                        Showing places saved from your last visit online — updates when you reconnect.
                    </p>
                )}
                <div className="filter-sidebar glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <div className="filter-dropdown-wrapper">
                        <select
                            className="filter-dropdown"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            {filters.map(filter => (
                                <option key={filter} value={filter}>
                                    {filter}
                                </option>
                            ))}
                        </select>
                        <svg className="filter-dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                </div>

                <div className="scrollable-cards">
                    {loading ? <p>Loading destinations...</p> : (
                        filteredDestinations.map((dest, i) => (
                            <div key={dest._id || `c-${i}`} style={{ marginBottom: '2rem' }}>
                                <DestinationCard destination={dest} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Admin Floating Add Button */}
            {user && user.role === 'admin' && (
                <button 
                    className="admin-fab"
                    onClick={() => {
                        // Reset the modal state when opening
                        if (addImagePreview && addImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(addImagePreview);
                        }
                        setAddForm({ name: '', description: '', location: '', category: '', exploreTime: '', bestTimeToVisit: '', rating: '4.5' });
                        setAddImageFile(null);
                        setAddImagePreview(null);
                        setShowAddModal(true);
                    }}
                    title="Add New Destination"
                >
                    +
                </button>
            )}

            {/* Simple Add Modal Placeholder */}
            {showAddModal && (
                <div
                    className="admin-modal-overlay glass"
                    onClick={() => {
                        if (addImagePreview && addImagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(addImagePreview);
                        }
                        setShowAddModal(false);
                        setAddForm({ name: '', description: '', location: '', category: '', exploreTime: '', bestTimeToVisit: '', rating: '4.5' });
                        setAddImageFile(null);
                        setAddImagePreview(null);
                    }}
                >
                    <div className="admin-modal glass-card" onClick={e => e.stopPropagation()}>
                        <h2>✨ Add New Destination</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Create a stunning new spot for travelers.</p>
                        
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Destination Name</label>
                            <input
                                type="text"
                                placeholder="e.g., The Grand Canyon"
                                value={addForm.name}
                                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
                            <input
                                type="text"
                                placeholder="e.g., Ranchi"
                                value={addForm.location}
                                onChange={(e) => setAddForm(prev => ({ ...prev, location: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                            <select
                                value={addForm.category}
                                onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                                style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
                            >
                                <option value="">Select category</option>
                                {categoryOptions.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Explore Time</label>
                            <input
                                type="text"
                                placeholder="e.g., 1-2 Days"
                                value={addForm.exploreTime}
                                onChange={(e) => setAddForm(prev => ({ ...prev, exploreTime: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rating (out of 5)</label>
                            <input
                                type="number"
                                placeholder="e.g., 4.5"
                                min="1" max="5" step="0.1"
                                value={addForm.rating}
                                onChange={(e) => setAddForm(prev => ({ ...prev, rating: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Best Time to Visit</label>
                            <input
                                type="text"
                                placeholder="e.g., October to March"
                                value={addForm.bestTimeToVisit}
                                onChange={(e) => setAddForm(prev => ({ ...prev, bestTimeToVisit: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea
                                placeholder="Describe the place..."
                                value={addForm.description}
                                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                                className="form-input"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', minHeight: '100px' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                    setAddImageFile(file);

                                    if (addImagePreview && addImagePreview.startsWith('blob:')) {
                                        URL.revokeObjectURL(addImagePreview);
                                    }

                                    if (!file) {
                                        setAddImagePreview(null);
                                        return;
                                    }
                                    const url = URL.createObjectURL(file);
                                    setAddImagePreview(url);
                                }}
                                style={{ width: '100%' }}
                            />
                            {addImagePreview && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <img
                                        src={addImagePreview}
                                        alt="Preview"
                                        style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    if (addImagePreview && addImagePreview.startsWith('blob:')) {
                                        URL.revokeObjectURL(addImagePreview);
                                    }
                                    setShowAddModal(false);
                                    setAddForm({ name: '', description: '', location: '', category: '', exploreTime: '', bestTimeToVisit: '', rating: '4.5' });
                                    setAddImageFile(null);
                                    setAddImagePreview(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={addingDestination}
                                onClick={async () => {
                                    const requireText = (v) => typeof v === 'string' && v.trim().length > 0;

                                    if (!requireText(addForm.name) || !requireText(addForm.description) || !requireText(addForm.location)) {
                                        alert('Please fill Destination Name, Description, and Location.');
                                        return;
                                    }
                                    if (!requireText(addForm.exploreTime) || !requireText(addForm.bestTimeToVisit) || !requireText(addForm.category)) {
                                        alert('Please select Category and fill Explore Time + Best Time to Visit.');
                                        return;
                                    }
                                    if (!addImageFile) {
                                        alert('Please choose a Photo.');
                                        return;
                                    }

                                    setAddingDestination(true);
                                    setLoading(true);
                                    try {
                                        const apiUrl = resolveApiUrl();
                                        const formData = new FormData();
                                        formData.append('name', addForm.name);
                                        formData.append('description', addForm.description);
                                        formData.append('location', addForm.location);
                                        formData.append('exploreTime', addForm.exploreTime);
                                        formData.append('bestTimeToVisit', addForm.bestTimeToVisit);
                                        formData.append('category', addForm.category);
                                        formData.append('rating', addForm.rating);
                                        formData.append('image', addImageFile);

                                        const res = await fetch(`${apiUrl}/api/destinations`, {
                                            method: 'POST',
                                            body: formData
                                        });

                                        if (!res.ok) {
                                            const errText = await res.text().catch(() => '');
                                            throw new Error(errText || `Server returned ${res.status}`);
                                        }

                                        // Fetch fresh list from backend (don't rely on offline cache).
                                        const refreshed = await fetch(`${apiUrl}/api/destinations`);
                                        const refreshedData = await refreshed.json();
                                        const list = Array.isArray(refreshedData) ? refreshedData : [];
                                        setDestinations(list);
                                        setDataSource('network');
                                        setCachedDestinations(list);

                                        // Close/reset only after successful save
                                        if (addImagePreview && addImagePreview.startsWith('blob:')) {
                                            URL.revokeObjectURL(addImagePreview);
                                        }
                                        setShowAddModal(false);
                                        setAddForm({ name: '', description: '', location: '', category: '', exploreTime: '', bestTimeToVisit: '', rating: '4.5' });
                                        setAddImageFile(null);
                                        setAddImagePreview(null);
                                    } catch (e) {
                                        alert(e?.message || 'Failed to add destination');
                                    } finally {
                                        setAddingDestination(false);
                                        setLoading(false);
                                    }
                                }}
                            >
                                {addingDestination ? 'Adding...' : 'Add Place'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Destinations;
