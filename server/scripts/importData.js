require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Cutoff = require('../models/Cutoff');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mhtcet_predictor';

async function importCSV(filePath) {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const results = [];
        console.log(`Reading CSV from ${filePath}...`);

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Normalize raw values into EXACT MHT-CET categoryCode
                if (data.instituteCode && data.instituteName && data.branch && data.percentile) {
                    let rawCategory = (data.category || '').trim();
                    let rawGender = (data.gender || 'G').trim();
                    
                    // The MHT-CET DB format requires categoryCodes like GOPENH, LOBCH.
                    // The rawCategory usually contains the code itself if extracted properly
                    let categoryCode = rawCategory;

                    if (!categoryCode) {
                        categoryCode = 'GOPEN'; // Ultimate fallback
                    }

                    results.push({
                        instituteCode: data.instituteCode.trim(),
                        instituteName: data.instituteName.trim(),
                        branch: data.branch.trim(),
                        categoryCode: categoryCode,
                        percentile: parseFloat(data.percentile),
                        city: (data.city || 'Unknown').trim(),
                        region: (data.region || 'Other').trim(),
                        capRound: parseInt(data.capRound) || 1,
                        year: 2024
                    });
                }
            })
            .on('end', async () => {
                try {
                    console.log(`Clearing existing records...`);
                    await Cutoff.deleteMany({});

                    console.log(`Inserting ${results.length} records...`);
                    // Use chunking for very large datasets if needed
                    const chunkSize = 5000;
                    for (let i = 0; i < results.length; i += chunkSize) {
                        const chunk = results.slice(i, i + chunkSize);
                        await Cutoff.insertMany(chunk);
                        process.stdout.write(`Imported ${i + chunk.length}/${results.length}...\r`);
                    }

                    console.log(`\n✅ Successfully imported ${results.length} records into MongoDB!`);
                    process.exit(0);
                } catch (err) {
                    console.error('❌ Error during database insertion:', err.message);
                    process.exit(1);
                }
            })
            .on('error', (err) => {
                console.error('❌ CSV Parsing Error:', err.message);
                process.exit(1);
            });
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    }
}

// Default to the recently extracted full cutoffs CSV
const defaultPath = path.join(__dirname, '../data/full_cutoffs.csv');
const filePath = process.argv[2] || defaultPath;

importCSV(filePath);
