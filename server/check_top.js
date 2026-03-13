require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkSpecificColleges() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const collegeCodes = ['3112','3012', '3182', '3199', '3181']; // SPIT, Thadomal, DJ Sanghvi, KJ Somaiya
        const mappedCodes = ['GSCO', 'GSCH', 'LSCO', 'LSCH', 'GSCS', 'GOPENS', 'GOPENH', 'GOPENO'];

        console.log(`--- Checking Cutoffs for Top Colleges ---`);

        const records = await Cutoff.find({
            instituteCode: { $in: collegeCodes },
            categoryCode: { $in: mappedCodes }
        }).sort({ instituteCode: 1, percentile: -1 });

        console.log(`Found ${records.length} relevant records.`);
        
        records.forEach(r => {
            console.log(`${r.instituteCode} | ${r.instituteName} | ${r.branch} | ${r.categoryCode} | ${r.percentile}% | ${r.region}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSpecificColleges();
