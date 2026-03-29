import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Destination from './models/Destination.js';
import User from './models/User.js';
import { destinations } from './data/destinations.js';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// JWT secret: use env in production; fallback only for dev so auth works when env is missing (e.g. other device / different env)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_in_production';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('Warning: JWT_SECRET not set in production. Set JWT_SECRET in your environment.');
}

// Transporter Setup

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// For local testing, we'll connect to memory or a local MongoDB fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Optional: Seed Database Endpoint
app.post('/api/seed', async (req, res) => {
    try {
        await Destination.deleteMany({});
        const created = await Destination.insertMany(destinations);
        res.json({ message: 'Database seeded successfully', data: created });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Destination Routes
app.get('/api/destinations', async (req, res) => {
    const getFallbackList = () => {
        return res.json(destinations.map((d, i) => ({ ...d, _id: i.toString() })));
    };

    try {
        if (mongoose.connection.readyState !== 1) {
            return getFallbackList();
        }

        const allDestinations = await Destination.find({}).maxTimeMS(3000); // 3-second limit

        if (!allDestinations || allDestinations.length === 0) {
            return getFallbackList();
        }
        res.json(allDestinations);
    } catch (error) {
        // If DB query times out or fails, gracefully return the fallback
        return getFallbackList();
    }
});

app.get('/api/destinations/:id', async (req, res) => {
    try {
        const getFallback = () => {
            let index = parseInt(req.params.id);
            if (isNaN(index)) {
                const numMatch = req.params.id.match(/\d+/);
                if (numMatch) {
                    index = parseInt(numMatch[0]) - 1;
                } else {
                    index = 0;
                }
            }
            const dest = destinations[index] || destinations[0];
            return res.json({ ...dest, _id: req.params.id });
        };

        if (mongoose.connection.readyState !== 1) {
            return getFallback();
        }

        // If ID is not a MongoDB ObjectId (e.g., fallback IDs like '1' or 'f2')
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return getFallback();
        }

        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return getFallback();
        }
        res.json(destination);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Destination (Admin Only)
app.post('/api/destinations', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // For offline testing: dynamically push to the destinations array 
            // In a real scenario, this gets lost on restart unless saved to a file
            const newDest = { ...req.body, _id: `fallback-new-${Date.now()}` };
            destinations.push(newDest);
            return res.status(201).json(newDest);
        }

        const newDestination = new Destination(req.body);
        await newDestination.save();
        res.status(201).json(newDestination);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Destination (Admin Only)
app.put('/api/destinations/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            let index = parseInt(req.params.id);
            if (isNaN(index)) {
                // Try finding by fallback id
                index = destinations.findIndex(d => d._id === req.params.id);
                if (index === -1) {
                    const numMatch = req.params.id.match(/\d+/);
                    if (numMatch) index = parseInt(numMatch[0]) - 1;
                }
            }
            if (index >= 0 && index < destinations.length) {
                destinations[index] = { ...destinations[index], ...req.body };
                return res.json(destinations[index]);
            }
            return res.status(404).json({ message: 'Destination not found in fallback' });
        }

        const updated = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// In-memory fallback for testing without DB
const fallbackUsers = [];

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let existingUser = null;
        if (mongoose.connection.readyState === 1) {
            try { existingUser = await User.findOne({ email }).maxTimeMS(3000); } catch (e) { console.warn("DB Error", e.message); }
        } else {
            existingUser = fallbackUsers.find(u => u.email === email);
        }

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = { _id: 'fallback_' + Date.now(), name, email, password: hashedPassword, role };

        if (mongoose.connection.readyState === 1) {
            try {
                const dbUser = new User({ name, email, password: hashedPassword, role });
                await dbUser.save();
                user = dbUser;
            } catch (e) { 
                console.warn("DB Save Error, using fallback", e.message); 
                fallbackUsers.push(user);
            }
        } else {
            fallbackUsers.push(user);
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '5d' });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user = null;

        if (mongoose.connection.readyState === 1) {
            try { user = await User.findOne({ email }).maxTimeMS(3000); } catch (e) { console.warn("DB Error", e.message); }
        }
        
        if (!user) {
            user = fallbackUsers.find(u => u.email === email);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. Please register first.' });
        }

        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (user.password === password);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials. Please register first.' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '5d' });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible on all network interfaces)`);
});
