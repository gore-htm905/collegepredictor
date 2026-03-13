require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkRegionDistribution() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const regions = await Cutoff.aggregate([
            { $group: { _id: "$region", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log("Region distribution:");
        regions.forEach(r => console.log(`${r._id}: ${r.count}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRegionDistribution();
