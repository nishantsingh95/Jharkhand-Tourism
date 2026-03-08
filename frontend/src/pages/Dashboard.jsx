import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [feedback, setFeedback] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        visitors: '284,600',
        revenue: '₹18.5 Cr',
        destinations: '126',
        rating: '4.6'
    });

    useEffect(() => {
        // Load feedback from localStorage
        const storedFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
        setFeedback(storedFeedback);

        // Load orders from localStorage
        const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        setOrders(storedOrders);
    }, []);

    const renderAnalytics = () => (
        <>
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>👥</div>
                    <span className="stat-trend trend-up">+12.5%</span>
                    <span className="stat-value">{stats.visitors}</span>
                    <span className="stat-label">Total Visitors</span>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>💰</div>
                    <span className="stat-trend trend-up">+18.2%</span>
                    <span className="stat-value">{stats.revenue}</span>
                    <span className="stat-label">Revenue</span>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fefce8', color: '#eab308' }}>📍</div>
                    <span className="stat-trend trend-up">+5</span>
                    <span className="stat-value">{stats.destinations}</span>
                    <span className="stat-label">Destinations</span>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>⭐</div>
                    <span className="stat-trend trend-up">+0.2</span>
                    <span className="stat-value">{stats.rating}</span>
                    <span className="stat-label">Avg. Rating</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <span style={{ color: '#10b981' }}>📈</span>
                        <h3>Visitor Trends</h3>
                    </div>
                    <div className="chart-container">
                        <svg viewBox="0 0 800 250" className="trend-svg">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" />
                            <line x1="0" y1="115" x2="800" y2="115" stroke="#f1f5f9" />
                            <line x1="0" y1="180" x2="800" y2="180" stroke="#f1f5f9" />

                            {/* Area Path */}
                            <path
                                d="M0,190 Q150,150 250,130 T400,120 T600,80 T800,110 L800,250 L0,250 Z"
                                fill="url(#chartGradient)"
                            />
                            {/* Line Path */}
                            <path
                                d="M0,190 Q150,150 250,130 T400,120 T600,80 T800,110"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {/* Labels */}
                            <g style={{ fontSize: '12px', fill: '#94a3b8' }}>
                                <text x="0" y="245">Jan</text>
                                <text x="160" y="245">Feb</text>
                                <text x="320" y="245">Mar</text>
                                <text x="480" y="245">Apr</text>
                                <text x="640" y="245">May</text>
                                <text x="770" y="245">Jun</text>
                            </g>
                        </svg>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <span style={{ color: '#f37335' }}>📍</span>
                        <h3>Top Destinations</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
                        {[
                            { name: 'Dassam Falls', value: 85, color: '#f37335' },
                            { name: 'Betla Park', value: 72, color: '#f37335' },
                            { name: 'Ranchi Hill', value: 65, color: '#f37335' },
                            { name: 'Jagannath Temple', value: 58, color: '#f37335' }
                        ].map(dest => (
                            <div key={dest.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <span>{dest.name}</span>
                                    <span style={{ color: '#64748b' }}>{dest.value}%</span>
                                </div>
                                <div style={{ height: '24px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${dest.value}%`,
                                        height: '100%',
                                        background: dest.color,
                                        borderRadius: '4px',
                                        transition: 'width 1.5s ease-out'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                <div className="chart-card">
                    <div className="chart-header">
                        <span style={{ color: '#ec4899' }}>👥</span>
                        <h3>Age Demographics</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '220px' }}>
                        <svg viewBox="0 0 100 100" style={{ width: '200px', height: '200px', transform: 'rotate(-90deg)' }}>
                            {/* Pie Slices (Simplified SVG Pie) */}
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#059669" strokeWidth="50" strokeDasharray="35 157" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#22c55e" strokeWidth="50" strokeDasharray="45 157" strokeDashoffset="-35" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#fb923c" strokeWidth="50" strokeDasharray="32 157" strokeDashoffset="-80" />
                            <circle r="25" cx="50" cy="50" fill="transparent" stroke="#facc15" strokeWidth="50" strokeDasharray="45 157" strokeDashoffset="-112" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Total Views</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                        {[
                            { label: '18-25', color: '#059669', p: '28%' },
                            { label: '26-35', color: '#22c55e', p: '35%' },
                            { label: '36-45', color: '#fb923c', p: '22%' },
                            { label: '46+', color: '#facc15', p: '15%' }
                        ].map(d => (
                            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color }}></div>
                                <span style={{ color: '#64748b' }}>{d.label}:</span>
                                <span>{d.p}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="feedback-section">
                    <div className="chart-header">
                        <span style={{ color: '#6366f1' }}>💬</span>
                        <h3>Recent User Feedback</h3>
                    </div>

                    {feedback.length > 0 ? (
                        <div className="feedback-list">
                            {feedback.slice(0, 3).map((item) => (
                                <div key={item.id} className="feedback-item">
                                    <div>
                                        <div className="feedback-user">
                                            <div className="avatar-circle">{item.name.charAt(0)}</div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h4>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.email}</span>
                                            </div>
                                        </div>
                                        <p className="feedback-msg">"{item.message}"</p>
                                    </div>
                                    <div className="meta-info">
                                        <div className="rating-stars">
                                            {'⭐'.repeat(parseInt(item.rating))}
                                        </div>
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                            <h4>No feedback yet</h4>
                            <p>Recent user submissions will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const renderAudit = () => (
        <div className="feedback-section" style={{ padding: '0' }}>
            <div className="chart-header" style={{ padding: '2rem 2rem 0 2rem' }}>
                <span style={{ color: '#10b981' }}>📋</span>
                <h3>User Transaction Records</h3>
            </div>

            {orders.length > 0 ? (
                <div style={{ overflowX: 'auto', padding: '1rem 2rem 2rem 2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product / Service</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Time</th>
                                <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <span style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                            {order.orderId}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{order.customer.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{order.customer.phone}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ marginBottom: '2px' }}>
                                                    • {item.name} <span style={{ color: '#94a3b8' }}>x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem' }}>
                                        <div style={{ color: '#1e293b', fontWeight: '500' }}>{order.date}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{order.time}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1rem', textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '1.1rem' }}>
                                        ₹{order.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
                    <h4>No transactions found</h4>
                    <p>User purchase and rental records will appear here.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="container">
                <header className="dashboard-header animate-fade-in">
                    <h1 className="dashboard-title">Dashboard Overview</h1>
                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            📈 Analytics
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('audit')}
                        >
                            📋 Audit Records
                        </button>
                    </div>
                </header>

                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {activeTab === 'analytics' ? renderAnalytics() : renderAudit()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
