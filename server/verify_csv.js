const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const filePath = path.join(__dirname, 'data/final_cutoffs.csv');

let totalLines = 0;
let passedRows = 0;
let failedRows = 0;
let failSample = [];

fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
        totalRows++;
        if (data.instituteCode && data.instituteName && data.branch && data.percentile) {
            passedRows++;
        } else {
            failedRows++;
            if (failSample.length < 5) failSample.push(data);
        }
    })
    .on('end', () => {
        console.log(`Total Rows Parsed: ${totalRows}`);
        console.log(`Passed rows: ${passedRows}`);
        console.log(`Failed rows: ${failedRows}`);
        if (failSample.length > 0) {
            console.log("\nSample Failed Row:");
            console.log(JSON.stringify(failSample[0], null, 2));
        }
        process.exit(0);
    });

let totalRows = 0;
