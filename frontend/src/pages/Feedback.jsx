import React, { useState } from 'react';

const Feedback = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const feedbackObj = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            rating: formData.get('rating'),
            message: formData.get('message'),
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        // Save to localStorage for the dashboard to read
        const existingFeedback = JSON.parse(localStorage.getItem('userFeedback') || '[]');
        localStorage.setItem('userFeedback', JSON.stringify([feedbackObj, ...existingFeedback]));

        setStatus('Thank you for your valuable feedback! We appreciate your help in improving Jharkhand Tourism.');
        e.target.reset();
    };

    return (
        <div className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem', maxWidth: '700px' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '3.5rem', borderRadius: '32px', background: 'white' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>We Value Your Feedback</h1>
                <p style={{ color: 'var(--text-light)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>Help us make your travel experience even better by sharing your thoughts or reporting any issues.</p>

                {status && <div style={{ padding: '1.2rem', background: '#d1fae5', color: '#065f46', borderRadius: '16px', marginBottom: '2.5rem', fontWeight: '500' }}>✅ {status}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-dark)' }}>Full Name</label>
                        <input name="name" type="text" required style={{ width: '100%', padding: '1.2rem', border: '1px solid #eaeaea', borderRadius: '16px', fontSize: '1rem', background: '#f9fafb' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-dark)' }}>Email Address</label>
                        <input name="email" type="email" required style={{ width: '100%', padding: '1.2rem', border: '1px solid #eaeaea', borderRadius: '16px', fontSize: '1rem', background: '#f9fafb' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-dark)' }}>Rate Your Experience</label>
                        <select name="rating" style={{ width: '100%', padding: '1.2rem', border: '1px solid #eaeaea', borderRadius: '16px', fontSize: '1rem', background: '#f9fafb' }}>
                            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                            <option value="4">⭐⭐⭐⭐ - Good</option>
                            <option value="3">⭐⭐⭐ - Average</option>
                            <option value="2">⭐⭐ - Poor</option>
                            <option value="1">⭐ - Terrible</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: 'var(--text-dark)' }}>Your Feedback</label>
                        <textarea name="message" required rows="6" style={{ width: '100%', padding: '1.2rem', border: '1px solid #eaeaea', borderRadius: '16px', fontSize: '1rem', resize: 'vertical', background: '#f9fafb' }} placeholder="Tell us what you loved or what we can improve..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', borderRadius: '16px' }}>Submit Feedback</button>
                </form>
            </div>
        </div>
    );
};
export default Feedback;
