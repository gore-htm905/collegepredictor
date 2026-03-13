require('dotenv').config();
const mongoose = require('mongoose');
const Cutoff = require('./models/Cutoff');

async function inspectData() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';
    try {
        await mongoose.connect(MONGODB_URI);
        
        const mappedCodes = ['GSCO', 'GSCH', 'LSCO', 'LSCH', 'GSCS'];
        const region = 'Konkan';

        console.log(`--- Inspecting Data for ${mappedCodes} in ${region} ---`);

        const records = await Cutoff.find({
            categoryCode: { $in: mappedCodes },
            region: region
        }).sort({ percentile: -1 });

        console.log(`Total SC records in Konkan: ${records.length}`);
        
        if (records.length > 0) {
            console.log("\nSample SC records in Konkan:");
            records.slice(0, 15).forEach((r, i) => {
                console.log(`${i+1}. ${r.instituteName} - ${r.branch} (${r.categoryCode}) at ${r.percentile}%`);
            });
        } else {
            console.log("\nNo SC records found in Konkan. Checking all SC records to see regions...");
            const scRegions = await Cutoff.aggregate([
                { $match: { categoryCode: { $in: mappedCodes } } },
                { $group: { _id: "$region", count: { $sum: 1 } } }
            ]);
            console.log("SC distribution by region:");
            console.log(scRegions);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

inspectData();
