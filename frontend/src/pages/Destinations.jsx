import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DestinationCard from '../components/DestinationCard';
import './Destinations.css';

// Custom Marker to avoid Leaflet's default React strict mode crash
const mapIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
    const [activeFilter, setActiveFilter] = useState('All Places');

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerLayerRef = useRef(null);

    const filters = ['All Places', 'Waterfalls', 'Wildlife', 'Temples', 'Hills & Views'];

    const fallbackData = [
        { _id: 'f1', name: "Netarhat", description: "Known as the 'Queen of Chotanagpur', Netarhat is a pristine hill station famous for its glorious sunrises and sunsets through the dense pine forests.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Pine_trees_of_Netarhat_Hill_station.jpg/960px-Pine_trees_of_Netarhat_Hill_station.jpg", location: "Latehar District", pricePerNight: 2500, rating: 4.8 },
        { _id: 'f2', name: "Dassam Falls", description: "A breathtaking waterfall where the Kanchi River falls from a height of 144 feet, creating a spectacular view and natural pool.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/960px-Dassam_falls.jpg", location: "Ranchi", pricePerNight: 1200, rating: 4.5 },
        { _id: 'f3', name: "Betla National Park", description: "A beautiful national park offering safaris, elephants, and wildlife viewing amidst dense Sal and Bamboo forests. One of India's first tiger reserves.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Entrance_of_Betla_national_park.jpg/960px-Entrance_of_Betla_national_park.jpg", location: "Palamu District", pricePerNight: 3000, rating: 4.9 },
        { _id: 'f4', name: "Deoghar Baidyanath Temple", description: "A major Hindu pilgrimage center featuring the famous Baidyanath Jyotirlinga, drawing millions of pilgrims focusing on serene spirituality.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Baba_Baidyanath_Jyotirlinga_Temple.jpg/960px-Baba_Baidyanath_Jyotirlinga_Temple.jpg", location: "Deoghar District", pricePerNight: 1500, rating: 4.6 },
        { _id: 'f5', name: "Hundru Falls", description: "A breathtaking waterfall where the Subarnarekha River falls from a height of 320 feet.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg/960px-Hundru_Falls%2C_Jharkhand%2C_India_4.jpg", location: "Ranchi", pricePerNight: 1000, rating: 4.4 },
        { _id: 'f6', name: "Shikharji (Parasnath Hill)", description: "The most important Jain Tirtha (pilgrimage site) located on Parasnath hill.", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Shikharji_Parasnath_Giridih.jpg/960px-Shikharji_Parasnath_Giridih.jpg", location: "Giridih", pricePerNight: 800, rating: 4.7 }
    ];

    useEffect(() => {
        fetch('http://localhost:5000/api/destinations')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setDestinations(data);
                } else {
                    setDestinations(fallbackData);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Backend fetch failed, using fallback:", err);
                setDestinations(fallbackData);
                setLoading(false);
            });
    }, []);

    const getFiltered = () => {
        if (activeFilter === 'All Places') return destinations;
        const lowerFilter = activeFilter.toLowerCase();

        return destinations.filter(d => {
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
        </div>
    );
};
export default Destinations;
