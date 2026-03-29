import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css'; // Reusing some base form styles

const DestinationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        location: '',
        pricePerNight: '',
        rating: '',
        exploreTime: '',
        bestTimeToVisit: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.role !== 'admin') {
                navigate('/');
                return;
            }
        } else {
            navigate('/login');
            return;
        }

        if (isEdit) {
            const fetchDestination = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const response = await fetch(`${API_URL}/destinations/${id}`);
                    if (!response.ok) throw new Error('Failed to fetch destination');
                    const data = await response.json();
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        image: data.image || '',
                        location: data.location || '',
                        pricePerNight: data.pricePerNight || '',
                        rating: data.rating || '',
                        exploreTime: data.exploreTime || '',
                        bestTimeToVisit: data.bestTimeToVisit || ''
                    });
                } catch (err) {
                    setError('Error loading destination details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDestination();
        }
    }, [id, navigate, isEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const url = isEdit ? `${API_URL}/destinations/${id}` : `${API_URL}/destinations`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Something went wrong');
            }

            alert(isEdit ? 'Destination updated successfully!' : 'Destination added successfully!');
            navigate('/destinations');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '8rem' }}>Loading form...</div>;

    return (
        <div className="auth-page">
            <div className="auth-box glass-card animate-fade-in" style={{ maxWidth: '600px', width: '90%' }}>
                <h2>{isEdit ? 'Modify Destination' : 'Add New Destination'}</h2>
                <p className="auth-subtitle">
                    {isEdit ? 'Update details for this place.' : 'Add a great new place to explore.'}
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Destination Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Netarhat" />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Latehar District" />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Description..."></textarea>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Image URL</label>
                        <input type="url" name="image" value={formData.image} onChange={handleChange} required placeholder="https://..." />
                    </div>

                    <div className="form-group">
                        <label>Price Per Night</label>
                        <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Rating (1-5)</label>
                        <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Time to Explore</label>
                        <input type="text" name="exploreTime" value={formData.exploreTime} onChange={handleChange} placeholder="e.g. 2-3 Days" />
                    </div>

                    <div className="form-group">
                        <label>Best Time to Visit</label>
                        <input type="text" name="bestTimeToVisit" value={formData.bestTimeToVisit} onChange={handleChange} placeholder="e.g. Oct to Mar" />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            {isEdit ? 'Save Changes' : 'Add Destination'}
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/destinations')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DestinationForm;
