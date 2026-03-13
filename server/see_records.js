require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function seeRecords() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        const records = await Cutoff.find().limit(10).lean();
        console.log("First 10 records in DB:");
        console.log(JSON.stringify(records, null, 2));
        
        const count = await Cutoff.countDocuments();
        console.log(`\nTotal Records: ${count}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seeRecords();
