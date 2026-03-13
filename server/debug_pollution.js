async function debugPollution() {
    const url = 'http://127.0.0.1:5000/api/predict';
    const payload = {
        percentile: 99,
        category: "OBC",
        branch: "Computer Engineering",
        region: "Pune Region"
    };

    console.log(`--- Debugging Pollution: ${JSON.stringify(payload)} ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log(`Total Results: ${data.count}`);
        
        const polluted = data.data.filter(r => r.region === 'Other' && !/Pune|COEP/i.test(r.city));
        if (polluted.length > 0) {
            console.log("\nPolluted Items (First 3):");
            polluted.slice(0, 3).forEach(p => {
                console.log(`- ${p.instituteName} | City: ${p.city} | Region: ${p.region}`);
            });
        } else {
            console.log("\nNo pollution found in logic (Maybe data is different).");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

debugPollution();
