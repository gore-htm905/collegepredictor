require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function debugExhaustive() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const percentile = 98.5;
        const minPercentile = percentile - 1.5;
        const maxPercentile = percentile + 1.5;

        console.log(`--- Exhaustive Debug for 98.5 ---`);
        
        const totalInRange = await Cutoff.countDocuments({
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        });
        console.log(`Total in range (97-100): ${totalInRange}`);

        const categories = await Cutoff.aggregate([
            { $match: { percentile: { $gte: minPercentile, $lte: maxPercentile } } },
            { $group: { _id: "$categoryCode", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('\nTop Categories in range:');
        categories.slice(0, 10).forEach(c => console.log(`${c._id}: ${c.count}`));

        const regions = await Cutoff.aggregate([
            { $match: { percentile: { $gte: minPercentile, $lte: maxPercentile } } },
            { $group: { _id: "$region", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('\nRegions in range:');
        regions.forEach(r => console.log(`${r._id}: ${r.count}`));

        const konkanOpen = await Cutoff.find({
            categoryCode: 'GOPENS',
            region: 'Konkan',
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        }).limit(5);
        console.log(`\nGOPENS in Konkan (97-100): ${konkanOpen.length} found (limit 5)`);
        konkanOpen.forEach(s => {
            console.log(`Inst: ${s.instituteName}, Branch: ${s.branch}, P: ${s.percentile}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugExhaustive();
