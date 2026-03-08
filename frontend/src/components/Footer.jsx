import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer bg-primary">
            <div className="container footer-content">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">Jharkhand<span>Tourism</span></Link>
                    <p>Experience the unexplored beauty, vibrant culture, and natural heritage of Jharkhand.</p>
                </div>
                <div className="footer-links">
                    <h4>Explore</h4>
                    <ul>
                        <li><Link to="/destinations">Destinations</Link></li>
                        <li><Link to="/">Culture & Heritage</Link></li>
                        <li><Link to="/">Wildlife</Link></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h4>Contact Us</h4>
                    <ul>
                        <li>Email: info@jharkhandtourism.com</li>
                        <li>Phone: +91 1800 123 4567</li>
                        <li>Address: Ranchi, Jharkhand, India</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom text-center">
                <p>&copy; {new Date().getFullYear()} Jharkhand Tourism. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
