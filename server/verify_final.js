async function verifyAPI() {
    const url = 'http://127.0.0.1:5000/api/predict';
    const payload = {
        percentile: 98.5,
        category: "SC",
        branch: "Computer Engineering",
        region: "Konkan (Mumbai/Thane/Ratnagiri)"
    };

    console.log(`Sending request to ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Count: ${data.count}`);
        
        if (data.data && data.data.length > 0) {
            console.log("\nFound Colleges (Top 10):");
            data.data.slice(0, 10).forEach((r, i) => {
                console.log(`${i+1}. ${r.instituteName} | ${r.branch} | ${r.percentile} (${r.status})`);
            });
            
            const spit = data.data.find(r => r.instituteName.includes('Sardar Patel'));
            if (spit) {
                console.log("\n✅ SUCCESS: Sardar Patel (SPIT) found in results!");
            }
        } else {
            console.log("\n❌ FAIL: No results found.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

verifyAPI();
