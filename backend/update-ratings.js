import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jharkhand-tourism';

mongoose.connect(uri)
    .then(async () => {
        const collection = mongoose.connection.db.collection('destinations');
        
        await collection.updateOne({ name: { $regex: /Bhatinda Fall/i } }, { $set: { rating: 4.3 } });
        await collection.updateOne({ name: { $regex: /Jagannath Mandir/i } }, { $set: { rating: 4.8 } });
        
        console.log('Update completed successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });
