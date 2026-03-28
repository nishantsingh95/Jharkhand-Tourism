import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import Footer from './components/Footer';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import Booking from './pages/Booking';
import Itinerary from './pages/Itinerary';
import ChatPage from './pages/ChatPage';
import Marketplace from './pages/Marketplace';
import Feedback from './pages/Feedback';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="auth-container">
                <Navbar />
                <OfflineBanner />
                <main style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
                        <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
