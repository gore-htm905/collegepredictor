require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkSPIT() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const records = await Cutoff.find({
            instituteCode: "3012"
        }).sort({ percentile: -1 }).lean();

        console.log(`Found ${records.length} records for SPIT (3012).`);
        records.forEach(r => {
            console.log(`- ${r.branch} | ${r.categoryCode} | ${r.percentile} | ${r.region}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSPIT();
