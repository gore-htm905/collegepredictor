require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function testOverhaul() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const percentile = 98.5;
        const category = 'SC';
        const branch = 'Computer Engineering';
        const region = 'Konkan (Mumbai/Thane/Ratnagiri)';

        const uPercentile = parseFloat(percentile);
        const minPercentile = uPercentile - 1.5;
        const maxPercentile = uPercentile + 1.5;

        const CATEGORY_MAP = {
            'OPEN': ['GOPENO', 'GOPENH', 'LOPENO', 'LOPENH', 'GOPENS'],
            'OBC': ['GOBCO', 'GOBCH', 'LOBCO', 'LOBCH', 'GOBCS'],
            'SC': ['GSCO', 'GSCH', 'LSCO', 'LSCH', 'GSCS'],
            'ST': ['GSTO', 'GSTH', 'LSTO', 'LSTH', 'GSTS'],
            'VJ': ['GVJO', 'GVJH', 'LVJO', 'LVJH', 'GVJS'],
            'NT1': ['GNT1O', 'GNT1H', 'LNT1O', 'LNT1H', 'GNT1S'],
            'NT2': ['GNT2O', 'GNT2H', 'LNT2O', 'LNT2H', 'GNT2S'],
            'NT3': ['GNT3O', 'GNT3H', 'LNT3O', 'LNT3H', 'GNT3S'],
            'EWS': ['EWS'],
            'TFWS': ['TFWS']
        };

        const mappedCodes = CATEGORY_MAP[category] || [category];

        console.log(`--- Testing Overhaul ---`);
        
        // Count each filter independently
        const c1 = await Cutoff.countDocuments({ percentile: { $gte: minPercentile, $lte: maxPercentile } });
        console.log(`1. Percentile range (97-100): ${c1}`);

        const c2 = await Cutoff.countDocuments({ percentile: { $gte: minPercentile, $lte: maxPercentile }, categoryCode: { $in: mappedCodes } });
        console.log(`2. P-Range + SC Category: ${c2}`);

        const normalizedRegion = region.split('(')[0].trim();
        const c3 = await Cutoff.countDocuments({ 
            percentile: { $gte: minPercentile, $lte: maxPercentile }, 
            categoryCode: { $in: mappedCodes },
            region: normalizedRegion 
        });
        console.log(`3. P-Range + SC + Region (${normalizedRegion}): ${c3}`);

        const branchKeyword = branch.split(' ')[0].trim();
        const c4 = await Cutoff.countDocuments({ 
            percentile: { $gte: minPercentile, $lte: maxPercentile }, 
            categoryCode: { $in: mappedCodes },
            branch: { $regex: branchKeyword, $options: 'i' }
        });
        console.log(`4. P-Range + SC + Branch (${branchKeyword}): ${c4}`);

        const finalCount = await Cutoff.countDocuments({
            percentile: { $gte: minPercentile, $lte: maxPercentile },
            categoryCode: { $in: mappedCodes },
            region: normalizedRegion,
            branch: { $regex: branchKeyword, $options: 'i' }
        });
        console.log(`5. FINAL QUERY COUNT: ${finalCount}`);

        if (finalCount === 0 && c2 > 0) {
            console.log("\nNo matches for final query. Showing samples for P-Range + SC:");
            const samples = await Cutoff.find({ 
                percentile: { $gte: minPercentile, $lte: maxPercentile }, 
                categoryCode: { $in: mappedCodes } 
            }).limit(10);
            samples.forEach(s => console.log(`- ${s.instituteName} | ${s.branch} | ${s.region} | ${s.percentile}`));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

testOverhaul();
