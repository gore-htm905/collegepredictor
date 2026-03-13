require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function checkOpenCodes() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        const codes = await Cutoff.distinct('categoryCode', { categoryCode: /^GOPEN/ });
        console.log('Open-related category codes:', codes);
        
        const counts = await Promise.all(codes.map(async code => {
            const count = await Cutoff.countDocuments({ categoryCode: code });
            return { code, count };
        }));
        console.log('Counts:', counts);
        
        const konkanOpen = await Cutoff.countDocuments({
            categoryCode: { $regex: /^GOPEN/ },
            region: 'Konkan',
            percentile: { $gte: 97, $lte: 100 }
        });
        console.log(`\nAny GOPEN* in Konkan (97-100): ${konkanOpen}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkOpenCodes();
