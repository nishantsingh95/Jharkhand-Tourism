import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveApiUrl } from '../utils/apiBase';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!navigator.onLine) {
            setError('Internet is required to create an account.');
            return;
        }

        const apiUrl = resolveApiUrl();

        if (!apiUrl) {
            setError('API URL not configured. Please set VITE_API_URL.');
            return;
        }

        console.log('Register payload', { name, email, password }, 'API URL', apiUrl);
        try {
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            let data = {};
            try {
                data = await res.json();
            } catch (_) {
                setError(res.ok ? 'Registration failed.' : `Server error (${res.status}). Please try again.`);
                return;
            }
            if (res.ok) {
                navigate('/login', { state: { message: 'Registration successful! Please login.' } });
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            const isNetworkError = !err.message || /fetch|network|failed to fetch/i.test(String(err.message));
            setError(isNetworkError ? 'Cannot connect to server. Check your connection and try again.' : (err.message || 'Server error during registration.'));
        }
    };

    return (
        <div className="auth-page align-center-fade animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <div className="auth-card glass-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join us to explore the unexplored</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

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

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Register As</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc', outline: 'none', color: '#334155' }}
                        >
                            <option value="user">Regular User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block auth-btn">
                        Register
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
