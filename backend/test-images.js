import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism';

mongoose.connect(uri)
    .then(async () => {
        const docs = await mongoose.connection.db.collection('destinations').find({}).toArray();
        const targets = docs.filter(d => d.name.includes('Fall') || d.name.includes('Mandir'));
        console.log(targets.map(d => ({name: d.name, image: d.image})));
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });
