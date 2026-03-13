require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkRange() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const minCode = await Cutoff.find().sort({ instituteCode: 1 }).limit(1).lean();
        const maxCode = await Cutoff.find().sort({ instituteCode: -1 }).limit(1).lean();

        console.log(`Min Institute Code: ${minCode[0]?.instituteCode}`);
        console.log(`Max Institute Code: ${maxCode[0]?.instituteCode}`);
        
        const count = await Cutoff.countDocuments();
        console.log(`Total count: ${count}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRange();
