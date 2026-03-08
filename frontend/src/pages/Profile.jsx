import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState({ name: 'Guest Explorer', email: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, we'd get this from an Auth context
        // For now, we'll try to find the email from the last booking or use a placeholder
        const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');

        if (storedOrders.length > 0) {
            const lastOrder = storedOrders[0];
            setUser({
                name: lastOrder.customer.name,
                email: lastOrder.customer.email
            });
            // Filter bookings for this specific user email
            const userEmail = lastOrder.customer.email;
            setBookings(storedOrders.filter(o => o.customer.email === userEmail));
        }

        setLoading(false);
    }, []);

    if (loading) return <div className="profile-container"><div className="container">Loading profile...</div></div>;

    return (
        <div className="profile-container">
            <div className="container">
                <header className="profile-header animate-fade-in">
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>My Travel Profile</h1>
                        <p style={{ color: '#64748b' }}>Manage your bookings and travel history in Jharkhand</p>
                    </div>
                </header>

                <div className="user-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="profile-avatar">
                        {user.name.charAt(0)}
                    </div>
                    <div className="user-info">
                        <h2>Namaste, {user.name}!</h2>
                        <p>{user.email || 'Complete a booking to see your email here'}</p>
                    </div>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📅 Recent Bookings & Purchases
                    </h3>

                    {bookings.length > 0 ? (
                        <div className="bookings-grid">
                            {bookings.map((booking) => (
                                <div key={booking.orderId} className="booking-card">
                                    <div className="booking-header">
                                        <span className="order-id">#{booking.orderId}</span>
                                        <span className="booking-status status-active">Confirmed</span>
                                    </div>
                                    <div className="booking-body">
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                            {booking.date} at {booking.time}
                                        </div>
                                        {booking.items.map((item, idx) => (
                                            <div key={idx} className="item-row">
                                                <span>{item.name} <span style={{ color: '#94a3b8' }}>x{item.quantity}</span></span>
                                                <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="booking-footer">
                                        <div className="total-amt">₹{booking.total}</div>
                                        <button className="btn-receipt" onClick={() => alert('Receipt downloading... (Demo Mode)')}>
                                            📄 Download Receipt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-bookings">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎒</div>
                            <h3>No bookings yet!</h3>
                            <p>Ready to explore Jharkhand? Head over to the Marketplace to start your adventure.</p>
                            <a href="/marketplace" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Visit Marketplace</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
