require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkPaddedSPIT() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const code = "03012";
        const records = await Cutoff.find({ instituteCode: code }).lean();
        console.log(`Found ${records.length} records for SPIT (${code})`);
        
        if (records.length > 0) {
            console.log("Sample records:");
            console.log(records.slice(0, 3).map(r => `${r.branch} | ${r.categoryCode} | ${r.percentile} | ${r.region}`));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkPaddedSPIT();
