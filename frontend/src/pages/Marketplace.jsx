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
    const [user, setUser] = useState(null);
    const [customItems, setCustomItems] = useState([]);
    const [removedItems, setRemovedItems] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [minRating, setMinRating] = useState('Any Rating');
    const [newItem, setNewItem] = useState({
        name: '', desc: '', price: '', category: 'Handcraft', subCategory: '', source: '', rating: '4.8', location: '', guideName: '', experience: '', date: '', guidePhone: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        const stored = localStorage.getItem('customMarketplaceItems');
        if (stored) {
            let parsed = JSON.parse(stored);
            let modified = false;
            parsed = parsed.map(item => {
                if (item.rating === '5.0' || item.rating === 5) {
                    modified = true;
                    // Hash to a pseudo-random value between 4.1 and 4.9
                    const hash = item.name.length + (item.price ? parseInt(item.price) : 0) * 7;
                    const val = 4.1 + (hash % 9) / 10;
                    return { ...item, rating: val.toFixed(1) };
                }
                return item;
            });
            if (modified) {
                localStorage.setItem('customMarketplaceItems', JSON.stringify(parsed));
            }
            setCustomItems(parsed);
        }
        
        const storedRemoved = localStorage.getItem('removedMarketplaceItems');
        if (storedRemoved) setRemovedItems(JSON.parse(storedRemoved));
    }, []);

    const removedSet = new Set((removedItems || []).map(String));
    const allItems = [...productsData, ...customItems].filter(item => !removedSet.has(String(item.id)));

    const getCategoryForTab = (tab) => {
        switch (tab) {
            case 'handcraft': return 'Handcraft';
            case 'guides': return 'Guide';
            case 'homestays': return 'Homestay';
            case 'vehicles': return 'Vehicle';
            case 'food': return 'Food';
            case 'events': return 'Event';
            default: return '';
        }
    };

    const currentCategory = getCategoryForTab(activeTab);
    const currentCategoryItems = allItems.filter(item => item.category === currentCategory);
    
    // Words to exclude from the filter dropdown
    const excludedFilters = ['ghugni', 'til barfi', 'anarsa', 'chugni'];
    
    const uniqueSubCategories = [...new Set(currentCategoryItems.map(item => item.subCategory).filter(Boolean))]
        .filter(sub => !excludedFilters.includes(sub.toLowerCase()));

    // If user switches tab, old subCategory (e.g. "Bamboo") may not exist for Food/Events — that hid all items.
    const effectiveSubCategory =
        subCategory === 'All' || uniqueSubCategories.includes(subCategory) ? subCategory : 'All';

    const filteredItems = allItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSubCategory = effectiveSubCategory === 'All' || item.subCategory === effectiveSubCategory;

        let matchesRating = true;
        if (minRating === '4.0 & Above') matchesRating = parseFloat(item.rating) >= 4.0;
        if (minRating === '4.5 & Above') matchesRating = parseFloat(item.rating) >= 4.5;

        return item.category === currentCategory && matchesSearch && matchesSubCategory && matchesRating;
    });

    useEffect(() => {
        setSubCategory('All');
        setMinRating('Any Rating');
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

    const handleRemoveItem = (id) => {
        const isCustom = customItems.some(item => item.id === id);
        if (isCustom) {
            const updatedCustomItems = customItems.filter(item => item.id !== id);
            localStorage.setItem('customMarketplaceItems', JSON.stringify(updatedCustomItems));
            setCustomItems(updatedCustomItems);
        } else {
            const updatedRemovedItems = [...removedItems, id];
            localStorage.setItem('removedMarketplaceItems', JSON.stringify(updatedRemovedItems));
            setRemovedItems(updatedRemovedItems);
        }
        
        // Ensure it is removed from cart if present
        setCart(prev => prev.filter(item => item.id !== id));
        
        setToast({ show: true, message: 'Item successfully removed!' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        const finalItem = { ...newItem };
        if (finalItem.category === 'Event') {
            finalItem.rating = '';
            finalItem.subCategory = '';
        }
        const itemObj = { ...finalItem, id: Date.now() };
        const updatedCustomItems = [itemObj, ...customItems];
        localStorage.setItem('customMarketplaceItems', JSON.stringify(updatedCustomItems));
        setCustomItems(updatedCustomItems);
        setIsAddModalOpen(false);
        setToast({ show: true, message: `Successfully added ${newItem.name}!` });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        setNewItem({ name: '', desc: '', price: '', category: 'Handcraft', subCategory: '', source: '', rating: '4.8', location: '', guideName: '', experience: '', date: '', guidePhone: '' });
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
    const needsDelivery = cart.some(item => item.category === 'Handcraft' || item.category === 'Food');

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

                        <button
                            onClick={() => setActiveTab('food')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'food' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'food' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>🍛</span> Food
                        </button>

                        <button
                            onClick={() => setActiveTab('events')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 1.4rem', borderRadius: '50px',
                                border: 'none', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease',
                                background: activeTab === 'events' ? '#2e8157' : '#f8fafc',
                                color: activeTab === 'events' ? 'white' : '#4a5568'
                            }}>
                            <span style={{ fontSize: '1.1rem' }}>🎉</span> Events
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
                            value={effectiveSubCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: '#4a5568', fontSize: '0.95rem', cursor: 'pointer', paddingRight: '1rem' }}>
                            <option value="All">All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</option>
                            {uniqueSubCategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>
                        <span style={{ color: '#4a5568' }}>⭐</span>
                        <select
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: '#4a5568', fontSize: '0.95rem', cursor: 'pointer', paddingRight: '1rem' }}>
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
                    {user && user.role === 'admin' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            style={{ background: '#2e8157', color: 'white', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s', marginLeft: '0.5rem' }}>
                            ➕ Add Item
                        </button>
                    )}
                </div>
                {/* Search & Filter Box */}
                {/* ... (Keep the search bar if useful, or remove if they want it gone too? Previous turn removed it). */}
                {/* Actually, user turn 910 was removing filtering/search too. */}
                {/* I'll keep the search bar for consistency with the screenshot, but remove the grid. */}

                {/* Content Area */}
                {filteredItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '24px', color: '#64748b', marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>No {activeTab} items found.</h2>
                        <p>Try setting filters to &quot;All&quot; and clear the search box. If you use the installed app, update it or clear site data so the latest catalog loads.</p>
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
                                    {item.category === 'Event' && (
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'white', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#2e8157', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                            🗓️ Upcoming
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
                                    {item.category === 'Food' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                    {item.category === 'Event' && item.subCategory && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(234, 179, 8, 0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>
                                            {item.subCategory}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ margin: '0', fontSize: '1.25rem', color: '#1e293b' }}>{item.name}</h3>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {item.rating && (
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', height: 'fit-content' }}>★ {item.rating}</span>
                                            )}
                                            {user && user.role === 'admin' && (
                                                <button onClick={() => handleRemoveItem(item.id)} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Item">🗑️</button>
                                            )}
                                        </div>
                                    </div>
                                    {item.category === 'Guide' && item.guideName && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            👤 {item.guideName}
                                            {item.experience && <span style={{ color: '#10b981', fontSize: '0.9rem', marginLeft: '10px' }}>⭐ {item.experience} Exp.</span>}
                                        </p>
                                    )}
                                    {(item.category === 'Homestay' || item.category === 'Vehicle' || item.category === 'Event' || item.category === 'Food') && item.location && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem' }}>
                                            📍 {item.location}
                                        </p>
                                    )}
                                    {item.category === 'Event' && item.date && (
                                        <p style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem' }}>
                                            📅 {item.date}
                                        </p>
                                    )}
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', minHeight: '40px' }}>{item.desc}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {Number(item.price) > 0 ? (
                                            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2e8157' }}>
                                                ₹{item.price}
                                                {item.category === 'Guide' || item.category === 'Vehicle' ? '/day' : item.category === 'Homestay' ? '/night' : item.category === 'Event' ? '/ticket' : item.category === 'Food' ? '/plate' : ''}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2e8157' }}>{item.category === 'Event' ? 'Free Entry' : 'Free'}</span>
                                        )}
                                        <button
                                            onClick={() => addToCart(item)}
                                            style={{ background: '#f97316', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                                            className="add-to-cart-btn">
                                            {item.category === 'Guide' ? 'Book Guide' : item.category === 'Homestay' ? 'Book Stay' : item.category === 'Vehicle' ? 'Rent Vehicle' : item.category === 'Event' ? 'Book Ticket' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cart Modal Overlay */}
                {isCartOpen && (
                    <div className="cart-modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                        <div className="cart-modal" style={{ width: '100%', maxWidth: '580px', height: '85vh', backgroundColor: '#f8fafc', borderRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'fadeScaleIn 0.3s forwards' }}>
                            <div style={{ background: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {orderSuccess ? '🎫 Booking Confirmation' : '🛍️ Your Cart'}
                                </h2>
                                <button onClick={() => setIsCartOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>✕</button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                {orderSuccess && receiptData ? (
                                    <div style={{ padding: '1rem' }}>
                                        <div id="printable-receipt" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                            <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                                <h2 style={{ color: '#2e8157', margin: '0 0 0.3rem 0', fontSize: '1.5rem' }}>Jharkhand Tourism</h2>
                                                <p style={{ margin: '0', color: '#64748b', fontSize: '0.8rem' }}>Official Booking Receipt</p>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#334155' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 0.2rem 0' }}><strong>Order ID:</strong> {receiptData.orderId}</p>
                                                    <p style={{ margin: '0' }}><strong>Date:</strong> {receiptData.date}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ margin: '0 0 0.2rem 0' }}><strong>Payment:</strong> {receiptData.customer.paymentMethod.toUpperCase()}</p>
                                                    <p style={{ margin: '0', color: '#16a34a', fontWeight: 'bold' }}>PAID</p>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                                                <p style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}><strong>Customer Details:</strong></p>
                                                <p style={{ margin: '0' }}>{receiptData.customer.name}</p>
                                                <p style={{ margin: '0' }}>Ph: {receiptData.customer.phone}</p>
                                            </div>

                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.5rem 0' }}>Item</th>
                                                        <th style={{ padding: '0.5rem 0', textAlign: 'center' }}>Qty</th>
                                                        <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receiptData.items.map(item => (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '0.6rem 0' }}>
                                                                <div>{item.name}</div>
                                                                {item.category === 'Guide' && (
                                                                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                                                                        Guide Ph: {item.guidePhone || `+91 9${String(item.id || '').replace(/\D/g, '').padStart(3, '0')} 55210`}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>{item.quantity}</td>
                                                            <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>{item.price && parseFloat(item.price) > 0 ? `₹${item.price * item.quantity}` : 'Free'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1e293b', paddingTop: '0.8rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                <span>Total Amount</span>
                                                <span style={{ color: '#2e8157' }}>₹{receiptData.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : cart.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>🛒</div>
                                        <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>Your cart is empty</h3>
                                        <p style={{ marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
                                        <button onClick={() => setIsCartOpen(false)} style={{ padding: '0.8rem 1.5rem', background: '#2e8157', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Exploring</button>
                                    </div>
                                ) : (
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 1rem' }}>
                                        <div className="cart-items" style={{ padding: '1rem 1.5rem' }}>
                                            {cart.map(item => (
                                                <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.8rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    <img src={item.source} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <h4 style={{ margin: '0', fontSize: '1rem', color: '#1e293b' }}>{item.name}</h4>
                                                            <p style={{ margin: '0', color: '#f97316', fontWeight: 'bold' }}>{item.price && parseFloat(item.price) > 0 ? `₹${item.price}` : 'Free'}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                                <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'none', border: 'none', padding: '0.2rem 0.6rem', cursor: 'pointer' }}>-</button>
                                                                <span style={{ width: '20px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                                <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'none', border: 'none', padding: '0.2rem 0.6rem', cursor: 'pointer' }}>+</button>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer' }}>🗑️</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FIXED FOOTER — always visible, never scrolls */}
                            {orderSuccess ? (
                                <div style={{ padding: '0.8rem 1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.8rem', flexShrink: 0 }}>
                                    <button onClick={handlePrintReceipt} style={{ flex: 1, padding: '0.75rem', background: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>📄 Download</button>
                                    <button onClick={closeAndResetCart} style={{ flex: 1, padding: '0.75rem', background: '#2e8157', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>Done ✓</button>
                                </div>
                            ) : cart.length > 0 ? (
                                <div style={{ padding: '0.8rem 1rem', background: 'white', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>
                                        <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                        <span style={{ color: '#2e8157' }}>₹{cartTotal}</span>
                                    </div>
                                    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="text" placeholder="Full Name" required value={checkoutDetails.name} onChange={e => setCheckoutDetails({ ...checkoutDetails, name: e.target.value })} style={{ flex: 1, padding: '0.55rem 0.7rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                                            <input type="tel" placeholder="Phone" required value={checkoutDetails.phone} onChange={e => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })} style={{ flex: 1, padding: '0.55rem 0.7rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                                        </div>
                                        <input type="email" placeholder="Email Address" required value={checkoutDetails.email} onChange={e => setCheckoutDetails({ ...checkoutDetails, email: e.target.value })} style={{ padding: '0.55rem 0.7rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                                        {needsAadhar && (
                                            <input type="text" placeholder="Aadhaar Card Number (12 digits)" required maxLength={12} pattern="\d{12}" title="Enter valid 12-digit Aadhaar number" value={checkoutDetails.aadhar} onChange={e => setCheckoutDetails({ ...checkoutDetails, aadhar: e.target.value.replace(/\D/g, '') })} style={{ padding: '0.55rem 0.7rem', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '0.85rem', letterSpacing: '0.1em' }} />
                                        )}
                                        {needsDelivery && (
                                            <textarea placeholder="Delivery Address" required rows="2" value={checkoutDetails.address} onChange={e => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })} style={{ padding: '0.55rem 0.7rem', borderRadius: '7px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '0.85rem' }} />
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <label onClick={() => setCheckoutDetails({ ...checkoutDetails, paymentMethod: 'upi' })} style={{ flex: 1, padding: '0.5rem', border: `2px solid ${checkoutDetails.paymentMethod === 'upi' ? '#2e8157' : '#e2e8f0'}`, borderRadius: '7px', textAlign: 'center', cursor: 'pointer', background: checkoutDetails.paymentMethod === 'upi' ? '#f0fdf4' : 'white', fontSize: '0.85rem', fontWeight: '600' }}>UPI</label>
                                            <label onClick={() => setCheckoutDetails({ ...checkoutDetails, paymentMethod: 'cash' })} style={{ flex: 1, padding: '0.5rem', border: `2px solid ${checkoutDetails.paymentMethod === 'cash' ? '#2e8157' : '#e2e8f0'}`, borderRadius: '7px', textAlign: 'center', cursor: 'pointer', background: checkoutDetails.paymentMethod === 'cash' ? '#f0fdf4' : 'white', fontSize: '0.85rem', fontWeight: '600' }}>Cash</label>
                                        </div>
                                        <button type="submit" style={{ background: '#2e8157', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Checkout • ₹{cartTotal}</button>
                                    </form>
                                </div>
                            ) : null}
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

                {/* Add Item Modal */}
                {isAddModalOpen && (
                    <div className="cart-modal-overlay no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                        <div className="cart-modal" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', overflow: 'hidden', animation: 'fadeScaleIn 0.3s forwards' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a1a1a' }}>➕ Add New Item</h2>
                                <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'white', border: '1px solid #e2e8f0', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '70vh' }}>
                                <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Name</label>
                                        <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Category</label>
                                            <select required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                <option value="Handcraft">Handcraft</option>
                                                <option value="Guide">Guide</option>
                                                <option value="Homestay">Homestay</option>
                                                <option value="Vehicle">Vehicle</option>
                                                <option value="Food">Food</option>
                                                <option value="Event">Event</option>
                                            </select>
                                        </div>
                                        {newItem.category !== 'Event' && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>SubCategory / Type</label>
                                                <input required value={newItem.subCategory} onChange={e => setNewItem({...newItem, subCategory: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Price (₹)</label>
                                            <input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        {newItem.category !== 'Event' && (
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Rating (ex: 4.8)</label>
                                                <input type="number" step="0.1" min="1" max="5" required value={newItem.rating} onChange={e => setNewItem({...newItem, rating: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Image URL</label>
                                        <input required value={newItem.source} onChange={e => setNewItem({...newItem, source: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Description</label>
                                        <textarea required rows="2" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }}></textarea>
                                    </div>
                                    {(newItem.category === 'Homestay' || newItem.category === 'Vehicle' || newItem.category === 'Event') && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Location</label>
                                            <input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    )}
                                    {newItem.category === 'Event' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Event Date(s) (e.g. 23rd-24th April)</label>
                                            <input value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    )}
                                    {newItem.category === 'Guide' && (
                                        <>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Guide Name</label>
                                                    <input value={newItem.guideName} onChange={e => setNewItem({...newItem, guideName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Experience (e.g. 5 yrs)</label>
                                                    <input value={newItem.experience} onChange={e => setNewItem({...newItem, experience: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 'bold' }}>Guide Phone Number</label>
                                                <input value={newItem.guidePhone} onChange={e => setNewItem({...newItem, guidePhone: e.target.value})} placeholder="+91 XXXXXXXXXX" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                        </>
                                    )}
                                    <button type="submit" style={{ background: '#2e8157', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>Save Item</button>
                                </form>
                            </div>
                        </div>
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
