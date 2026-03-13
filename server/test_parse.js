const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const filePath = path.join(__dirname, 'data/final_cutoffs.csv');

fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
        if (data.instituteCode && data.instituteCode.includes('3012')) {
            console.log("Parsed record for 3012:");
            console.log(data);
            process.exit(0);
        }
    })
    .on('end', () => {
        console.log("Finished reading without finding 3012.");
    });
