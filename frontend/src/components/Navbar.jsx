import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check for logged in user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Close dropdown when route changes
        setShowDropdown(false);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''} ${!isHome ? 'nav-solid' : 'nav-transparent'}`}>
            <div className="container nav-content">
                <Link to="/" className="nav-logo">
                    <span className="logo-text">Jharkhand<span className="logo-accent">Tourism</span></span>
                </Link>
                <ul className="nav-links">
                    <li><NavLink to="/" end>Home</NavLink></li>
                    <li><NavLink to="/destinations">Destinations</NavLink></li>
                    <li><NavLink to="/itinerary">Itinerary</NavLink></li>
                    <li><NavLink to="/chat">Chat</NavLink></li>
                    <li><NavLink to="/marketplace">Marketplace</NavLink></li>
                    <li><NavLink to="/feedback">Feedback</NavLink></li>
                    <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                </ul>
                <div className="nav-cta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {user ? (
                        <div className="profile-container" style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="profile-trigger"
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: '2px solid white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>

                            {showDropdown && (
                                <div className="profile-dropdown glass" style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: '0',
                                    width: '220px',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    padding: '1.2rem',
                                    zIndex: 1001,
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <div className="user-info-section" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{user.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item"
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            padding: '0.6rem 0',
                                            color: '#ef4444',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)' }}>Login / Register</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
