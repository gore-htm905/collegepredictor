require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkSCBranches() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const mappedCodes = ['GSCO', 'GSCH', 'LSCO', 'LSCH', 'GSCS'];
        const records = await Cutoff.find({
            percentile: { $gte: 97, $lte: 100 },
            categoryCode: { $in: mappedCodes }
        }).select('branch instituteName region percentile').lean();

        console.log(`Found ${records.length} SC records in 97-100 range.`);
        records.forEach(r => {
            console.log(`- ${r.branch} | ${r.region} | ${r.instituteName} | ${r.percentile}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSCBranches();
