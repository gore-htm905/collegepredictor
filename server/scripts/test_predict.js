const http = require('http');

const data = JSON.stringify({
    percentile: 80,
    category: 'SC',
    gender: 'Male',
    branch: 'Information Technology',
    region: ''
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/predict',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(responseBody);
            console.log('Total Count:', parsedData.count || 0);
            console.log('Dream:', (parsedData.data?.dream || []).length);
            console.log('Moderate:', (parsedData.data?.moderate || []).length);
            console.log('Safe:', (parsedData.data?.safe || []).length);
            const allResults = [
                ...(parsedData.data?.dream || []),
                ...(parsedData.data?.moderate || []),
                ...(parsedData.data?.safe || [])
            ];
            if (allResults.length > 0) {
                const first = allResults[0];
                console.log('\n--- Sample Result ---');
                console.log('Institute:', first.instituteName);
                console.log('Branch:', first.branch);
                console.log('Percentile:', first.percentile);
                console.log('CategoryCode:', first.categoryCode);
                console.log('Type:', first.predictionType);
            }
        } catch (e) {
            console.error('Error:', e.message);
        }
    });
});

req.write(data);
req.end();
