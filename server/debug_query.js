require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function debugQuery() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const percentile = 98.5;
        const category = 'GOPENS';
        const branch = 'Computer Science and Engineering'; // Example branch from screenshot (truncated)
        const region = 'Konkan';

        const minPercentile = percentile - 1.5;
        const maxPercentile = percentile + 1.5;

        console.log(`--- Debugging Query for ${percentile} ---`);
        console.log(`Range: ${minPercentile} - ${maxPercentile}`);
        console.log(`Category: ${category}`);
        console.log(`Branch: ${branch}`);
        console.log(`Region: ${region}`);

        // 1. Check total in range
        const inRange = await Cutoff.countDocuments({
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        });
        console.log(`Records in percentile range: ${inRange}`);

        // 2. Check total with category in range
        const withCat = await Cutoff.countDocuments({
            categoryCode: category,
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        });
        console.log(`Records with category ${category} in range: ${withCat}`);

        // 3. Check total with region and category in range
        const withRegion = await Cutoff.countDocuments({
            categoryCode: category,
            region: region,
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        });
        console.log(`Records with category and region ${region} in range: ${withRegion}`);

        // 4. Check specific branch matches
        if (branch !== 'All Branches') {
             const withBranch = await Cutoff.countDocuments({
                categoryCode: category,
                branch: branch,
                percentile: { $gte: minPercentile, $lte: maxPercentile }
            });
            console.log(`Records with branch "${branch}" in range (any region): ${withBranch}`);
            
            const withAll = await Cutoff.countDocuments({
                categoryCode: category,
                region: region,
                branch: branch,
                percentile: { $gte: minPercentile, $lte: maxPercentile }
            });
            console.log(`Records with ALL filters: ${withAll}`);
        }

        // 5. Look for sample data to see what matches
        const samples = await Cutoff.find({
            percentile: { $gte: minPercentile, $lte: maxPercentile }
        }).limit(5);
        console.log('\nSample data in percentile range:');
        samples.forEach(s => {
            console.log(`Code: ${s.instituteCode}, Branch: ${s.branch}, Cat: ${s.categoryCode}, P: ${s.percentile}, R: ${s.region}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugQuery();
