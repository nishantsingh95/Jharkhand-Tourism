import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const rawUrl = import.meta.env.VITE_API_URL?.trim();
        // Fallback logic: If env var points to localhost but we are on a production site, ignore it and use origin.
        const isProduction = !window.location.hostname.includes('localhost');
        const apiUrl = (rawUrl && (!rawUrl.includes('localhost') || !isProduction))
            ? rawUrl
            : (isProduction ? window.location.origin : 'https://jharkhand-tourism-hsfs.onrender.com');

        if (!apiUrl) {
            setError('API URL not configured. Please set VITE_API_URL.');
            return;
        }

        try {
            console.log('Login request to:', `${apiUrl}/api/auth/login`);

            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            let data = {};
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : {};
            } catch (_) {
                setError(`Server error (${res.status}) while reading response. Please try again.`);
                return;
            }

            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                const msg = data && data.message ? data.message : 'Login failed';
                setError(`${msg} (code ${res.status})`);
            }
        } catch (err) {
            const isNetworkError = !err.message || /fetch|network|failed to fetch/i.test(String(err.message));
            if (isNetworkError) {
                setError('Cannot connect to server. Check your connection and try again.');
            } else {
                setError(`Server error during login: ${err.message || 'Unknown error'}`);
            }
        }
    };

    return (
        <div className="auth-page align-center-fade animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <div className="auth-card glass-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to plan your next Jharkhand adventure</p>

                {successMessage && <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMessage}</div>}
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: '#64748b'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block auth-btn">
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
