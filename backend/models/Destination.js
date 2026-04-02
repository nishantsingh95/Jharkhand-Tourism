import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    // Admin panel currently doesn't collect price; keep it optional.
    pricePerNight: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    category: { type: String },
    exploreTime: { type: String },
    bestTimeToVisit: { type: String }
});

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
