import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Serve uploaded images (for admin add/edit).
const uploadsRoot = path.resolve('uploads');
const destinationsUploadDir = path.join(uploadsRoot, 'destinations');
fs.mkdirSync(destinationsUploadDir, { recursive: true });
app.use('/uploads', express.static(uploadsRoot));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, destinationsUploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname || '');
        const safeExt = ext ? ext.toLowerCase() : '.jpg';
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

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
        return destinations.map((d, i) => ({ ...d, _id: i.toString() }));
    };

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json(getFallbackList());
        }

        const allDestinations = await Destination.find({}).maxTimeMS(3000); // 3-second limit

        if (!allDestinations || allDestinations.length === 0) {
            return res.json(getFallbackList());
        }

        // Merge fallback destinations with DB destinations.
        // This prevents the UI from showing only "just-added" items when the DB
        // is not fully seeded yet.
        const dbList = allDestinations.map(d => d.toObject());
        const fallbackList = getFallbackList();

        const byName = new Map();
        for (const f of fallbackList) {
            if (f?.name) byName.set(f.name, f);
        }

        // Prefer DB values when names collide.
        for (const dbDest of dbList) {
            if (dbDest?.name) byName.set(dbDest.name, dbDest);
        }

        const merged = [...dbList, ...Array.from(byName.values()).filter(f => !dbList.some(db => db.name === f.name))];
        res.json(merged);
    } catch (error) {
        // If DB query times out or fails, gracefully return the fallback
        return res.json(getFallbackList());
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

// Admin: create a new destination (with image upload)
app.post('/api/destinations', upload.single('image'), async (req, res) => {
    try {
        const { name, description, location, exploreTime, bestTimeToVisit, category } = req.body || {};
        const imageFile = req.file;

        if (!name || !description || !location) {
            return res.status(400).json({ message: 'name, description, and location are required' });
        }
        if (!imageFile) {
            return res.status(400).json({ message: 'image file is required' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/destinations/${imageFile.filename}`;

        const payload = {
            name,
            description,
            location,
            image: imageUrl,
            exploreTime: exploreTime || undefined,
            bestTimeToVisit: bestTimeToVisit || undefined,
            category: category || undefined,
            pricePerNight: 0,
            rating: 0
        };

        if (mongoose.connection.readyState !== 1) {
            // Fallback in-memory persistence for dev/testing when DB is down.
            destinations.push(payload);
            return res.status(201).json({ ...payload, _id: (destinations.length - 1).toString() });
        }

        const created = await Destination.create(payload);
        return res.status(201).json(created);
    } catch (error) {
        console.error('Create destination error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create destination' });
    }
});

// Admin: delete destination
app.delete('/api/destinations/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            // For fallback IDs like 'fallback-0'
            const idx = destinations.findIndex(d => d._id === req.params.id || `fallback-${destinations.indexOf(d)}` === req.params.id);
            if (idx > -1) {
                destinations.splice(idx, 1);
                return res.json({ message: 'Test destination deleted successfully' });
            }
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ message: 'Deleted locally' });
        }
        
        const deleted = await Destination.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Destination not found' });
        }
        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        console.error('Delete destination error:', error);
        res.status(500).json({ message: error.message || 'Failed to delete destination' });
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
