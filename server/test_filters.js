async function testFilters() {
    const url = 'http://127.0.0.1:5000/api/predict';
    
    // Test Case: Pune Region + Computer Engineering
    const payload = {
        percentile: 99,
        category: "OBC",
        branch: "Computer Engineering",
        region: "Pune Region"
    };

    console.log(`--- Testing Filters: ${JSON.stringify(payload)} ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Results found: ${data.count}`);
        
        if (data.data && data.data.length > 0) {
            const first = data.data[0];
            console.log("\nSample Result:");
            console.log(`Name: ${first.instituteName}`);
            console.log(`Branch: ${first.branch}`);
            console.log(`Region: ${first.region}`);
            
            // Validation
            const allComputer = data.data.every(r => r.branch.toLowerCase().includes('computer'));
            const allPune = data.data.every(r => r.region === 'Western Maharashtra');
            
            console.log(`\nValidation:`);
            console.log(`- All branches contain 'computer' word: ${allComputer ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`- All regions are 'Western Maharashtra': ${allPune ? '✅ PASS' : '❌ FAIL'}`);
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testFilters();
