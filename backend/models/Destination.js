import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    exploreTime: { type: String },
    bestTimeToVisit: { type: String }
});

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
