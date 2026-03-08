import React, { useState, useEffect } from 'react';
import { productsData } from '../data/productsData';
import './Marketplace.css';

const Marketplace = () => {
    const [activeTab, setActiveTab] = useState('handcraft');
    const [searchQuery, setSearchQuery] = useState('');
    const [subCategory, setSubCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [checkoutDetails, setCheckoutDetails] = useState({ name: '', email: '', phone: '', address: '', paymentMethod: 'upi', aadhar: '' });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiStatus, setUpiStatus] = useState('pending'); // pending, processing, success
    const [receiptData, setReceiptData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });

    const filteredItems = productsData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSubCategory = subCategory === 'All' || item.subCategory === subCategory;

        if (activeTab === 'handcraft') {
            return item.category === 'Handcraft' && matchesSearch && matchesSubCategory;
        } else if (activeTab === 'guides') {
            return item.category === 'Guide' && matchesSearch && matchesSubCategory;
        } else if (activeTab === 'homestays') {
            return item.category === 'Homestay' && matchesSearch && matchesSubCategory;
        } else if (activeTab === 'vehicles') {
            return item.category === 'Vehicle' && matchesSearch && matchesSubCategory;
        }

        // For other tabs we won't filter yet as no data is added
        return false;
    });

    useEffect(() => {
        setSubCategory('All');
    }, [activeTab]);

    useEffect(() => window.scrollTo(0, 0), []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Show Toast Notification
        setToast({ show: true, message: `${product.name} added to cart!` });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const completeOrder = () => {
        const generatedReceipt = {
            orderId: 'JH-' + Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            items: [...cart],
            total: cartTotal,
            customer: { ...checkoutDetails }
        };

        // Save to Audit Records (localStorage)
        const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        localStorage.setItem('userOrders', JSON.stringify([generatedReceipt, ...existingOrders]));

        setReceiptData(generatedReceipt);
        setOrderSuccess(true);
        setShowUpiModal(false);
        setUpiStatus('pending');
    };

    const closeAndResetCart = () => {
        setCart([]);
        setOrderSuccess(false);
        setIsCartOpen(false);
        setCheckoutDetails({ name: '', email: '', phone: '', address: '', paymentMethod: 'upi', aadhar: '' });
        setReceiptData(null);
    };

    const handlePrintReceipt = () => {
        const content = document.getElementById('printable-receipt').innerHTML;
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Booking Receipt - ${receiptData.orderId}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                        h2 { color: #2e8157; margin: 0 0 0.5rem 0; font-size: 2rem; text-align: center; }
                        .text-center { text-align: center; }
                        .mb-4 { margin-bottom: 2rem; }
                        .border-bottom { border-bottom: 2px dashed #cbd5e1; padding-bottom: 1.5rem; }
                        .flex { display: flex; justify-content: space-between; margin-bottom: 1.5rem; font-size: 1.1rem; }
                        .bg-light { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                        th, td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: left; }
                        th { color: #64748b; font-weight: bold; }
                        .text-right { text-align: right; }
                        .text-center-col { text-align: center; }
                        .total-row { display: flex; justify-content: space-between; border-top: 2px solid #1e293b; padding-top: 1rem; font-size: 1.5rem; font-weight: bold; color: #1e293b; }
                        .text-green { color: #2e8157; }
                        .text-success { color: #16a34a; font-weight: bold; }
                        .text-muted { color: #64748b; margin: 0; }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleCheckout = (e) => {
        e.preventDefault();

        if (checkoutDetails.paymentMethod === 'upi') {
            setShowUpiModal(true);
        } else {
            completeOrder();
        }
    };

    const processDummyUpi = () => {
        setUpiStatus('processing');
        setTimeout(() => {
            setUpiStatus('success');
            setTimeout(() => {
                completeOrder();
            }, 1500);
        }, 2500);
    };

    const needsAadhar = cart.some(item => item.category === 'Homestay' || item.category === 'Vehicle');

    return (
        <div className="marketplace-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '5rem' }}>
            <div className="container" style={{ maxWidth: '100%', padding: '0 2rem', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', color: '#1a1a1a', marginBottom: '0.5rem' }}>Local Marketplace</h1>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Discover exquisite handcrafts, local guides, homestays, and vehicles from Jharkhand</p>
                </div>

                {/* Explore Box */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '1.2rem', marginTop: 0 }}>Explore:</h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setActiveTab('handcraft')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'handcraft' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'handcraft' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>🏺</span> Handcraft
                        </button>


                        <button
                            onClick={() => setActiveTab('guides')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'guides' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'guides' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>👤</span> Guides
                        </button>

                        <button
                            onClick={() => setActiveTab('homestays')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'homestays' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'homestays' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>📍</span> Homestays
                        </button>

                        <button
                            onClick={() => setActiveTab('vehicles')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'vehicles' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'vehicles' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>🚙</span> Vehicles
                        </button>
                    </div>
                </div>

                {/* Search & Filter Box */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1rem 1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '8px', padding: '0.6rem 1rem', border: '1px solid #e2e8f0', minWidth: '200px' }}>
                        <span style={{ color: '#a0aec0', marginRight: '8px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#4a5568', fontSize: '0.95rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                        <span style={{ color: '#4a5568' }}>🏷️</span>
                        <select
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: '#4a5568', fontSize: '0.95rem', cursor: 'pointer', paddingRight: '1rem' }}>
                            <option value="All">All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</option>
                            {activeTab === 'handcraft' && (
                                <>
                                    <option value="Bamboo">Bamboo</option>
                                    <option value="Stone Carving">Stone Carving</option>
                                    <option value="Sohrai Painting">Sohrai Painting</option>
                                    <option value="Handloom">Handloom</option>
                                    <option value="Tribal Art">Tribal Art</option>
                                </>
                            )}
                            {activeTab === 'guides' && (
                                <>
                                    <option value="City Tour">City Tour</option>
                                    <option value="Wildlife Safari">Wildlife Safari</option>
                                    <option value="Trekking">Trekking</option>
                                    <option value="Spiritual">Spiritual</option>
                                    <option value="Cultural">Cultural</option>
                                </>
                            )}
                            {activeTab === 'homestays' && (
                                <>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Resort">Resort</option>
                                    <option value="Guest House">Guest House</option>
                                    <option value="Heritage">Heritage</option>
                                    <option value="Eco-Stay">Eco-Stay</option>
                                </>
                            )}
                            {activeTab === 'vehicles' && (
                                <>
                                    <option value="Scooter">Scooter</option>
                                    <option value="Motorcycle">Motorcycle</option>
                                    <option value="Car">Car / Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Van">Van / Bus</option>
                                    <option value="Luxury">Luxury</option>
                                    <option value="Adventure">Adventure</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                        <span style={{ color: '#4a5568' }}>⭐</span>
                        <select style={{ border: 'none', background: 'transparent', outline: 'none', color: '#4a5568', fontSize: '0.95rem', cursor: 'pointer', paddingRight: '1rem' }}>
                            <option>Any Rating</option>
                            <option>4.0 & Above</option>
                            <option>4.5 & Above</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s', marginLeft: 'auto', position: 'relative' }}>
                        🛒 Cart
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
                {/* Search & Filter Box */}
                {/* ... (Keep the search bar if useful, or remove if they want it gone too? Previous turn removed it). */}
                {/* Actually, user turn 910 was removing filtering/search too. */}
                {/* I'll keep the search bar for consistency with the screenshot, but remove the grid. */}

                {/* Content Area */}
                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '24px', color: '#64748b', marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>No {activeTab} items found.</h2>
                        <p>Check back later or change your filters!</p>
                    </div>
                ) : (
                    <div className="marketplace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {filteredItems.map(item => (
                            <div key={item.id} className="product-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease' }}>
                                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                    <img src={item.source} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {item.category === 'Handcraft' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#ea580c' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                    {item.category === 'Guide' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(59, 130, 246, 0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                    {item.category === 'Homestay' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(236, 72, 153, 0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                    {item.category === 'Vehicle' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(168, 85, 247, 0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: '0', fontSize: '1.25rem', color: '#1e293b' }}>{item.name}</h3>
                                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', height: 'fit-content' }}>★ {item.rating}</span>
                                    </div>
                                    {item.category === 'Guide' && item.guideName && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            👤 {item.guideName}
                                            {item.experience && <span style={{ color: '#10b981', fontSize: '0.9rem', marginLeft: '10px' }}>⭐ {item.experience} Exp.</span>}
                                        </p>
                                    )}
                                    {(item.category === 'Homestay' || item.category === 'Vehicle') && item.location && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem' }}>
                                            📍 {item.location}
                                        </p>
                                    )}
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', minHeight: '40px' }}>{item.desc}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2e8157' }}>
                                            ₹{item.price}
                                            {item.category === 'Guide' || item.category === 'Vehicle' ? '/day' : item.category === 'Homestay' ? '/night' : ''}
                                        </span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{ background: '#f97316', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                                            className="add-to-cart-btn">
                                            {item.category === 'Guide' ? 'Book Guide' : item.category === 'Homestay' ? 'Book Stay' : item.category === 'Vehicle' ? 'Rent Vehicle' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cart Modal Overlay */}
                {isCartOpen && (
                    <div className="cart-modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', transition: 'opacity 0.3s' }}>
                        <div className="cart-modal" style={{ width: orderSuccess ? '650px' : '600px', maxWidth: '100vw', height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s forwards' }}>
                            <div style={{ background: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', zIndex: 10 }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {orderSuccess ? '🎫 Booking Confirmation' : '🛍️ Your Cart'}
                                </h2>
                                {!orderSuccess && <button onClick={() => setIsCartOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>✕</button>}
                            </div>

                            {orderSuccess && receiptData ? (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    {/* Printable Receipt Area */}
                                    <div id="printable-receipt" style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'white', margin: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                            <h2 style={{ color: '#2e8157', margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>Jharkhand Tourism</h2>
                                            <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem' }}>Official Booking Receipt</p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#334155' }}>
                                            <div>
                                                <p style={{ margin: '0 0 0.3rem 0' }}><strong>Order ID:</strong> {receiptData.orderId}</p>
                                                <p style={{ margin: '0' }}><strong>Date:</strong> {receiptData.date}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: '0 0 0.3rem 0' }}><strong>Payment:</strong> {receiptData.customer.paymentMethod.toUpperCase()}</p>
                                                <p style={{ margin: '0', color: '#16a34a', fontWeight: 'bold' }}>PAID</p>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                            <p style={{ margin: '0 0 0.3rem 0', color: '#1e293b' }}><strong>Customer Details:</strong></p>
                                            <p style={{ margin: '0 0 0.3rem 0', color: '#475569' }}>{receiptData.customer.name}</p>
                                            <p style={{ margin: '0 0 0.3rem 0', color: '#475569' }}>Ph: {receiptData.customer.phone}</p>
                                            {receiptData.customer.aadhar && (
                                                <p style={{ margin: '0', color: '#475569' }}>Aadhar: {receiptData.customer.aadhar.replace(/^(.{8})/, '********')}</p>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#1e293b', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.5rem 0' }}>Item / Service</th>
                                                        <th className="text-center-col" style={{ padding: '0.5rem 0', textAlign: 'center' }}>Qty</th>
                                                        <th className="text-right" style={{ padding: '0.5rem 0', textAlign: 'right' }}>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receiptData.items.map(item => (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '0.8rem 0', color: '#334155' }}>
                                                                <div style={{ fontWeight: '500' }}>{item.name}</div>
                                                                <div className="text-muted" style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.category === 'Guide' ? `Local Guide (${item.guideName})` : item.category === 'Homestay' ? `Accommodation (${item.location})` : item.category === 'Vehicle' ? `Rental (${item.location})` : 'Handcraft'}</div>
                                                            </td>
                                                            <td className="text-center-col" style={{ padding: '0.8rem 0', textAlign: 'center', color: '#475569' }}>{item.quantity}</td>
                                                            <td className="text-right" style={{ padding: '0.8rem 0', textAlign: 'right', color: '#1e293b', fontWeight: '500' }}>₹{item.price * item.quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1e293b', paddingTop: '1rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                                            <span>Total Amount</span>
                                            <span className="text-green" style={{ color: '#2e8157' }}>₹{receiptData.total}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="no-print" style={{ padding: '1.5rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.03)' }}>
                                        <button onClick={handlePrintReceipt} style={{ flex: 1, padding: '1rem', background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                                            📄 Download / Print
                                        </button>
                                        <button onClick={closeAndResetCart} style={{ flex: 1, padding: '1rem', background: '#2e8157', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46,129,87,0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>🛒</div>
                                    <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>Your cart is empty</h3>
                                    <p style={{ marginBottom: '2rem' }}>Looks like you haven't added any authentic handcrafts yet.</p>
                                    <button onClick={() => setIsCartOpen(false)} style={{ padding: '0.8rem 1.5rem', background: '#2e8157', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 12px rgba(46,129,87,0.2)' }}>Start Exploring</button>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
                                        {cart.map(item => (
                                            <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                <img src={item.source} alt={item.name} style={{ width: '85px', height: '85px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: '600' }}>{item.name}</h4>
                                                        <p style={{ margin: '0', color: '#f97316', fontWeight: '800', fontSize: '1.1rem' }}>₹{item.price}</p>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                            <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', padding: '0.3rem 0.8rem', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>-</button>
                                                            <span style={{ margin: '0', fontSize: '0.95rem', fontWeight: '600', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', padding: '0.3rem 0.8rem', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>+</button>
                                                        </div>
                                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', padding: '0.3rem 0.6rem', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = 'none'}>🗑️ Remove</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cart-checkout-section" style={{ background: 'white', padding: '1.5rem 2rem 2.5rem', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.03)', zIndex: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                                            <span>Subtotal</span>
                                            <span style={{ fontWeight: '800', color: '#2e8157', fontSize: '1.4rem' }}>₹{cartTotal}</span>
                                        </div>

                                        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                required
                                                value={checkoutDetails.name}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })}
                                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                required
                                                value={checkoutDetails.email}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, email: e.target.value })}
                                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                required
                                                value={checkoutDetails.phone}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
                                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            />
                                            <textarea
                                                placeholder="Delivery / Billing Address"
                                                required
                                                rows="2"
                                                value={checkoutDetails.address}
                                                onChange={e => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
                                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                                            />
                                            {needsAadhar && (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Aadhar Number (Mandatory for Stays/Rentals)"
                                                        required
                                                        maxLength="12"
                                                        pattern="\d{12}"
                                                        title="Please enter a valid 12-digit Aadhar Number"
                                                        value={checkoutDetails.aadhar}
                                                        onChange={e => setCheckoutDetails({ ...checkoutDetails, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ef4444', outline: 'none', background: '#fef2f2' }}
                                                    />
                                                    <span style={{ fontSize: '0.75rem', color: '#ef4444', position: 'absolute', bottom: '-18px', left: '5px' }}>* Required for ID Verification</span>
                                                </div>
                                            )}

                                            <div style={{ marginTop: needsAadhar ? '1rem' : '0.5rem' }}>
                                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#4a5568', fontSize: '0.95rem' }}>Payment Method:</p>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.8rem', border: checkoutDetails.paymentMethod === 'upi' ? '2px solid #2e8157' : '1px solid #cbd5e1', borderRadius: '8px', background: checkoutDetails.paymentMethod === 'upi' ? '#f0fdf4' : 'white' }}>
                                                        <input type="radio" name="payment" value="upi" checked={checkoutDetails.paymentMethod === 'upi'} onChange={() => setCheckoutDetails({ ...checkoutDetails, paymentMethod: 'upi' })} style={{ cursor: 'pointer' }} />
                                                        <strong>UPI</strong>
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.8rem', border: checkoutDetails.paymentMethod === 'cash' ? '2px solid #2e8157' : '1px solid #cbd5e1', borderRadius: '8px', background: checkoutDetails.paymentMethod === 'cash' ? '#f0fdf4' : 'white' }}>
                                                        <input type="radio" name="payment" value="cash" checked={checkoutDetails.paymentMethod === 'cash'} onChange={() => setCheckoutDetails({ ...checkoutDetails, paymentMethod: 'cash' })} style={{ cursor: 'pointer' }} />
                                                        <strong>Cash</strong>
                                                    </label>
                                                </div>
                                            </div>

                                            <button type="submit" style={{ background: '#2e8157', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '1rem', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(46,129,87,0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                Checkout • ₹{cartTotal}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Dummy UPI Payment Overlay */}
                {showUpiModal && (
                    <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', width: '400px', maxWidth: '90%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', animation: 'fadeScaleIn 0.3s ease-out' }}>
                            {upiStatus === 'pending' && (
                                <>
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px dashed #cbd5e1' }}>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: '30px', marginBottom: '1rem' }} />
                                        <div style={{ background: 'white', padding: '1rem', margin: '0 auto', width: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="150" height="150" viewBox="0 0 100 100" style={{ fill: '#334155' }}>
                                                {/* Dummy QR Code Pattern */}
                                                <rect x="10" y="10" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                                <rect x="65" y="10" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                                <rect x="10" y="65" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                                <rect x="15" y="15" width="15" height="15" />
                                                <rect x="70" y="15" width="15" height="15" />
                                                <rect x="15" y="70" width="15" height="15" />
                                                <path d="M40 10h20v5H40zM55 20h5v10h-5zM45 25h5v5h-5zM40 35h20v5H40zM80 40h10v10H80zM10 45h20v5H10zM15 55h5v5h-5zM25 50h5v10h-5zM60 45h20v5H60zM40 50h10v5H40zM50 60h10v5H50zM75 65h15v5H75zM85 75h5v5h-5zM65 85h25v5H65zM45 70h15v15H45zM50 75h5v5h-5z" />
                                            </svg>
                                        </div>
                                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Scan with any UPI App to Pay</p>
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#1e293b' }}>Paying <span style={{ color: '#2e8157' }}>Jharkhand Tourism</span></h3>
                                    <h2 style={{ fontSize: '2.5rem', margin: '0 0 1.5rem 0', color: '#1a1a1a', fontWeight: '800' }}>₹{cartTotal}</h2>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowUpiModal(false)} style={{ flex: 1, padding: '1rem', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={processDummyUpi} style={{ flex: 1, padding: '1rem', border: 'none', background: '#2e8157', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(46,129,87,0.3)' }}>Simulate Payment</button>
                                    </div>
                                </>
                            )}

                            {upiStatus === 'processing' && (
                                <div style={{ padding: '3rem 1rem' }}>
                                    <div className="spinner" style={{ border: '4px solid rgba(46,129,87,0.1)', borderLeftColor: '#2e8157', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }}></div>
                                    <h3 style={{ color: '#1e293b', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>Processing Payment...</h3>
                                    <p style={{ color: '#64748b' }}>Please do not close this window</p>
                                </div>
                            )}

                            {upiStatus === 'success' && (
                                <div style={{ padding: '3rem 1rem' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'white', fontSize: '3rem', animation: 'scaleIn 0.3s ease-out' }}>✓</div>
                                    <h3 style={{ color: '#166534', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Payment Successful!</h3>
                                    <p style={{ color: '#64748b' }}>Redirecting to order confirmation...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Toast Pop-up Notification */}
                {toast.show && (
                    <div style={{
                        position: 'fixed',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#16a34a',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '50px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        zIndex: 2000,
                        animation: 'slideDownFade 0.3s ease-out'
                    }}>
                        ✅ {toast.message}
                    </div>
                )}

                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @keyframes slideDownFade {
                        0% { opacity: 0; transform: translate(-50%, -20px); }
                        100% { opacity: 1; transform: translate(-50%, 0); }
                    }
                    @keyframes fadeScaleIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0); }
                        to { transform: scale(1); }
                    }
                `}</style>

            </div>
        </div>
    );
};

export default Marketplace;
