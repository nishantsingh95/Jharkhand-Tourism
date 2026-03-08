import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './AITripPlanner.css';

// SVG Icons for the timeline
const HeartIcon = () => <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>;
const CarIcon = () => <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>; // simplified to arrows for transport or car
const FoodIcon = () => <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const PinIcon = () => <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const ClockIcon = () => <svg width="14" height="14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

const AITripPlanner = () => {
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState('Standard (₹2500 - ₹5000)');
    const [interest, setInterest] = useState('Nature & Wildlife');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const printRef = useRef();

    const handleGenerate = (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Simulate AI generation delay
        setTimeout(() => {
            setLoading(false);
            const generatedResult = [];

            const getHotel = (budg, loc, idx) => {
                const lux = [`Radisson Blu ${loc}`, `Premium Taj Resort ${loc}`, `Heritage Villa ${loc}`, `Luxury Suites ${loc}`];
                const std = [`Hotel Capitol Hill`, `${loc} Residency`, `Comfort Inn ${loc}`, `The Boutique Stay`];
                const bag = [`${loc} Backpackers`, `Zostel ${loc}`, `Nomad Stay ${loc}`, `Local Homestay`];
                if (budg.includes('Budget')) return bag[idx % bag.length];
                if (budg.includes('Standard')) return std[idx % std.length];
                return lux[idx % lux.length];
            };

            const getMeals = (budg, idx) => {
                const lux = { b: ['Waterfront Buffet', 'Taj Spread', 'Oasis Lounge'], l: ['Yellow Sapphire', 'The Oriental', 'Royal Feast'], d: ['The Great Kabab Factory', 'Skyline Dine', 'Elite Grill'] };
                const std = { b: ['Kaveri Restaurant', 'Cafe Coffee Day', 'Bakers Lounge'], l: ['The Ruin House Cafe', 'Urban Thali', 'Spice Route'], d: ['Moti Mahal Delux', 'Pind Balluchi', 'Junction Restaurant'] };
                const bag = { b: ['Sharma Tea Stall', 'Local Dhaba', 'Raju Snacks'], l: ['Apna Dhaba', 'Street Thali', 'City Canteen'], d: ['New Delhi Budget', 'Night Market Chowk', 'Corner Dine'] };

                let set = lux;
                if (budg.includes('Standard')) set = std;
                if (budg.includes('Budget')) set = bag;

                return {
                    b: set.b[idx % set.b.length],
                    l: set.l[idx % set.l.length],
                    d: set.d[idx % set.d.length]
                };
            };

            const allDestinations = [
                { name: 'Dassam Falls', city: 'Ranchi', tags: ['Nature & Wildlife', 'General Explorer'], duration: '2-3 hours' },
                { name: 'Hundru Falls', city: 'Ranchi', tags: ['Nature & Wildlife', 'General Explorer'], duration: '2-3 hours' },
                { name: 'Jonha Falls', city: 'Ranchi', tags: ['Nature & Wildlife', 'Adventure Sports'], duration: '2 hours' },
                { name: 'Tribal Museum Ranchi', city: 'Ranchi', tags: ['Culture & Heritage', 'General Explorer'], duration: '1.5-2 hours' },
                { name: 'Tagore Hill', city: 'Ranchi', tags: ['Culture & Heritage', 'General Explorer'], duration: '1-2 hours' },
                { name: 'Rock Garden', city: 'Ranchi', tags: ['General Explorer'], duration: '1-1.5 hours' },
                { name: 'Jagannath Temple', city: 'Ranchi', tags: ['Spiritual Journey', 'Culture & Heritage'], duration: '1-2 hours' },
                { name: 'Sun Temple Bundu', city: 'Ranchi', tags: ['Spiritual Journey', 'Culture & Heritage'], duration: '1-2 hours' },
                { name: 'Pahari Mandir', city: 'Ranchi', tags: ['Spiritual Journey', 'General Explorer'], duration: '1-2 hours' },
                { name: 'McCluskieganj', city: 'Ranchi', tags: ['Culture & Heritage', 'Nature & Wildlife'], duration: '3-4 hours' },
                { name: 'Patratu Valley', city: 'Ramgarh', tags: ['Nature & Wildlife', 'Adventure Sports', 'General Explorer'], duration: '2-4 hours' },
                { name: 'Rajrappa Temple', city: 'Ramgarh', tags: ['Spiritual Journey', 'Culture & Heritage'], duration: '2-3 hours' },
                { name: 'Sohrai Art Village', city: 'Hazaribagh', tags: ['Culture & Heritage'], duration: '2-3 hours' },
                { name: 'Hazaribagh National Park', city: 'Hazaribagh', tags: ['Nature & Wildlife', 'General Explorer'], duration: '3-5 hours' },
                { name: 'Khandoli Park', city: 'Giridih', tags: ['Adventure Sports', 'Nature & Wildlife'], duration: '2-3 hours' },
                { name: 'Shikharji', city: 'Giridih', tags: ['Spiritual Journey', 'Culture & Heritage', 'Adventure Sports', 'General Explorer'], duration: '4-6 hours' },
                { name: 'Netarhat', city: 'Latehar', tags: ['Nature & Wildlife', 'General Explorer', 'Adventure Sports', 'Culture & Heritage'], duration: '3-5 hours' },
                { name: 'Lodh Falls', city: 'Latehar', tags: ['Nature & Wildlife', 'Adventure Sports'], duration: '2-3 hours' },
                { name: 'Betla National Park', city: 'Palamu', tags: ['Nature & Wildlife', 'General Explorer', 'Adventure Sports'], duration: '4-5 hours' },
                { name: 'Dalma Wildlife Sanctuary', city: 'Jamshedpur', tags: ['Nature & Wildlife', 'General Explorer', 'Adventure Sports'], duration: '4-6 hours' },
                { name: 'Jubilee Park', city: 'Jamshedpur', tags: ['General Explorer', 'Nature & Wildlife', 'Culture & Heritage'], duration: '2-3 hours' },
                { name: 'Dimna Lake', city: 'Jamshedpur', tags: ['Adventure Sports', 'Nature & Wildlife'], duration: '2-3 hours' },
                { name: 'Burudih Lake', city: 'Ghatshila', tags: ['Adventure Sports', 'Nature & Wildlife'], duration: '2-3 hours' },
                { name: 'Ghatshila', city: 'Ghatshila', tags: ['Nature & Wildlife', 'Culture & Heritage', 'General Explorer'], duration: '3-4 hours' },
                { name: 'Deoghar Baidyanath', city: 'Deoghar', tags: ['Spiritual Journey', 'General Explorer', 'Culture & Heritage'], duration: '2-4 hours' },
                { name: 'Trikut Pahar', city: 'Deoghar', tags: ['Adventure Sports', 'Spiritual Journey', 'Nature & Wildlife'], duration: '3-4 hours' },
                { name: 'Maluti Temples', city: 'Dumka', tags: ['Culture & Heritage', 'Spiritual Journey'], duration: '2-3 hours' },
                { name: 'Massanjore Dam', city: 'Dumka', tags: ['Nature & Wildlife', 'General Explorer'], duration: '2-3 hours' }
            ];

            // Filter destinations strictly by the selected interest
            let filteredDestinations = allDestinations.filter(d => d.tags.includes(interest));

            // Fallback just in case
            if (filteredDestinations.length === 0) {
                filteredDestinations = allDestinations;
            }

            const cityOrder = ['Ranchi', 'Ramgarh', 'Hazaribagh', 'Giridih', 'Deoghar', 'Dumka', 'Ghatshila', 'Jamshedpur', 'Latehar', 'Palamu'];

            // Group by city
            const cityGroups = {};
            filteredDestinations.forEach(d => {
                if (!cityGroups[d.city]) cityGroups[d.city] = [];
                cityGroups[d.city].push(d);
            });

            // Sort cities
            let sortedCities = Object.keys(cityGroups).sort((a, b) => {
                let idxA = cityOrder.indexOf(a);
                let idxB = cityOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });

            const numDays = parseInt(days, 10) || 1;

            // If we have more cities than days, just take the first numDays cities
            if (sortedCities.length > numDays) {
                sortedCities = sortedCities.slice(0, numDays);
            }

            // Distribute total days evenly among cities
            const C = sortedCities.length;
            const baseDays = Math.floor(numDays / C);
            const extraDays = numDays % C;

            const cityDaysMap = {};
            sortedCities.forEach((city, idx) => {
                cityDaysMap[city] = baseDays + (idx < extraDays ? 1 : 0);
            });

            const padSuffixes = [
                { suffix: 'Local Market', duration: '1.5-2 hours' },
                { suffix: 'Scenic Viewpoint', duration: '1 hour' },
                { suffix: 'Heritage Walk', duration: '2 hours' },
                { suffix: 'Food Tour', duration: '2-3 hours' },
                { suffix: 'Sunset Point', duration: '1.5 hours' },
                { suffix: 'City Museum', duration: '1-2 hours' },
                { suffix: 'Botanical Gardens', duration: '2-3 hours' },
                { suffix: 'Cultural Square', duration: '1-2 hours' },
                { suffix: 'Street Shopping', duration: '2 hours' },
                { suffix: 'Photography Walk', duration: '2 hours' },
                { suffix: 'Historical Monument', duration: '1.5-2 hours' },
                { suffix: 'Artisan Village', duration: '2-3 hours' },
                { suffix: 'Nature Trail', duration: '2-3 hours' },
                { suffix: 'Riverfront Walk', duration: '1-1.5 hours' },
                { suffix: 'Evening Bazaar', duration: '2 hours' }
            ];

            const availableDays = [];
            sortedCities.forEach(city => {
                const allocatedDays = cityDaysMap[city];
                const neededActsCount = allocatedDays * 3;
                let realActs = cityGroups[city].map(d => ({ name: d.name, city: city, duration: d.duration }));

                let selectedActs = [...realActs];

                // If more real acts than needed, truncate; if fewer, generate smart padded experiences
                if (selectedActs.length > neededActsCount) {
                    selectedActs = selectedActs.slice(0, neededActsCount);
                } else if (selectedActs.length < neededActsCount) {
                    let padIdx = 0;
                    while (selectedActs.length < neededActsCount) {
                        const padData = padSuffixes[padIdx % padSuffixes.length];
                        selectedActs.push({ name: `${city} ${padData.suffix}`, city: city, duration: padData.duration });
                        padIdx++;
                    }
                }

                for (let i = 0; i < selectedActs.length; i += 3) {
                    availableDays.push({
                        city: city,
                        activities: selectedActs.slice(i, i + 3)
                    });
                }
            });

            for (let i = 0; i < numDays; i++) {
                const dayPlan = availableDays[i]; // No modulo needed! It matches perfectly.
                const mainCity = dayPlan.city;
                const dailyActs = dayPlan.activities;

                const hotelName = getHotel(budget, mainCity, i);
                const meals = getMeals(budget, i);

                generatedResult.push({
                    day: i + 1,
                    title: `${mainCity} Exploration`,
                    mapQuery: encodeURIComponent(`${mainCity}, Jharkhand`),
                    activities: [
                        { time: '08:30 AM', shift: 'Morning', desc: `Enjoy breakfast at ${meals.b} before kicking off your day.`, icon: <HeartIcon /> },
                        { time: '10:00 AM', shift: 'Late Morning', desc: `1st Stop: Head over to ${dailyActs[0].name} (${mainCity}). Spend the morning exploring its features. ⏱️ Est. Time: ${dailyActs[0].duration}`, icon: <CarIcon /> },
                        { time: '01:00 PM', shift: 'Noon', desc: `Recharge with a delicious lunch at ${meals.l}.`, icon: <FoodIcon /> },
                        { time: '02:30 PM', shift: 'Afternoon', desc: `2nd Stop: Journey to ${dailyActs[1].name} (${mainCity}) for an immersive afternoon experience. ⏱️ Est. Time: ${dailyActs[1].duration}`, icon: <PinIcon /> },
                        { time: '05:00 PM', shift: 'Late Afternoon', desc: `3rd Stop: Visit ${dailyActs[2].name} (${mainCity}) and catch the beautiful evening views. ⏱️ Est. Time: ${dailyActs[2].duration}`, icon: <PinIcon /> },
                        { time: '08:00 PM', shift: 'Evening', desc: `Settle down for dinner at ${meals.d} reflecting on today's amazing city journey.`, icon: <FoodIcon /> },
                        { time: '09:30 PM', shift: 'Night', desc: `Check-in and overnight stay at ${hotelName} in ${mainCity}.`, icon: <HeartIcon /> }
                    ]
                });
            }

            setResult(generatedResult);
        }, 1500);
    };

    const downloadPDF = () => {
        const element = printRef.current;
        const opt = {
            margin: 10,
            filename: `Jharkhand_Itinerary_${days}Days.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="ai-planner-wrapper page-container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="ai-planner-header text-center" style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-dark)' }}>✨ AI Trip Itinerary Generator</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Let our Smart AI craft the perfect detailed trip to Jharkhand based on your exact preferences.</p>
                </div>

                {!result && !loading && (
                    <form onSubmit={handleGenerate} className="ai-planner-form glass-card" style={{ padding: '3rem', borderRadius: '24px', background: 'white' }}>
                        <div className="form-group grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-block">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Days to Stay</label>
                                <input type="number" min="1" max="14" value={days} onChange={e => setDays(e.target.value)} className="form-control" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '12px' }} />
                            </div>
                            <div className="input-block">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Budget per Person</label>
                                <select value={budget} onChange={e => setBudget(e.target.value)} className="form-control" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '12px' }}>
                                    <option>Budget (₹1000 - ₹2500)</option>
                                    <option>Standard (₹2500 - ₹5000)</option>
                                    <option>Luxury (₹5000+)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Preferred Experience / Interest</label>
                            <select value={interest} onChange={e => setInterest(e.target.value)} className="form-control" style={{ width: '100%', padding: '1rem', border: '1px solid #ddd', borderRadius: '12px' }}>
                                <option>General Explorer</option>
                                <option>Nature & Wildlife</option>
                                <option>Culture & Heritage</option>
                                <option>Adventure Sports</option>
                                <option>Spiritual Journey</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', marginTop: '2rem', borderRadius: '12px', fontWeight: '700' }}>Generate Detailed Itinerary</button>
                    </form>
                )}

                {loading && (
                    <div className="ai-loader text-center glass-card" style={{ padding: '5rem 0', borderRadius: '24px', background: 'white' }}>
                        <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
                        <h4 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700' }}>Analyzing Preferences...</h4>
                        <p style={{ color: 'var(--text-light)' }}>Crafting perfect routes, booking mockups, and meal plans.</p>
                    </div>
                )}

                {result && (
                    <div className="ai-result animate-fade-in" style={{ background: '#fafafc', padding: '3rem', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div className="result-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                            <button onClick={downloadPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: '600' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Download PDF
                            </button>
                            <button onClick={() => setResult(null)} className="btn" style={{ fontWeight: '600', color: '#4b5563', padding: '0.8rem 1.5rem' }}>Modify</button>
                        </div>

                        <div ref={printRef} className="pdf-container" style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #eaeaea' }}>
                            <div className="pdf-header" style={{ marginBottom: '2rem' }}>
                                <h2 style={{ color: 'var(--text-dark)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Jharkhand Explorer Itinerary</h2>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>{days} Days | {budget} | {interest}</p>
                            </div>

                            <hr style={{ border: 'none', borderTop: '2px solid #222', marginBottom: '2rem' }} />

                            <div className="itinerary-timeline">
                                {result.map((item, idx) => (
                                    <div key={idx} className="timeline-day" style={{ marginBottom: '3rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                            <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.3rem', fontWeight: '800' }}>
                                                Day {item.day}: {item.title}
                                            </h3>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${item.mapQuery || encodeURIComponent(item.title)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#059669', textDecoration: 'none', fontWeight: '600', background: '#d1fae5', padding: '0.4rem 1rem', borderRadius: '20px', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 5px rgba(16,185,129,0.1)' }}>
                                                📍 View on Map
                                            </a>
                                        </div>
                                        <div className="schedule-list">
                                            {item.activities.map((act, i) => (
                                                <div key={i} className="schedule-row" style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem 0', borderBottom: '1px solid #f3f4f6' }}>
                                                    <div className="icon-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '0.2rem', minWidth: '30px' }}>
                                                        {act.icon}
                                                    </div>
                                                    <div className="content-wrap" style={{ flexGrow: 1 }}>
                                                        <p style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1.05rem', fontWeight: '500', lineHeight: '1.5' }}>{act.desc}</p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#9ca3af', fontSize: '0.85rem' }}>
                                                            <ClockIcon /> {act.shift}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITripPlanner;
