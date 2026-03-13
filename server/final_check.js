async function finalCheck() {
    const url = 'http://127.0.0.1:5000/api/predict';
    const payload = {
        percentile: 99,
        category: "OBC",
        branch: "Computer Engineering",
        region: "Pune Region"
    };

    console.log(`--- Final Isolation Check: ${JSON.stringify(payload)} ---`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        console.log(`Total Results: ${data.count}`);
        
        const mumbaiColleges = data.data.filter(r => /Mumbai|Thane|SPIT|VJTI|Sardar Patel/i.test(r.instituteName + r.city));
        
        if (mumbaiColleges.length > 0) {
            console.log("\n❌ FAIL: Mumbai colleges found in Pune results:");
            mumbaiColleges.forEach(c => console.log(`- ${c.instituteName} | City: ${c.city}`));
        } else {
            console.log("\n✅ PASS: No Mumbai colleges found in Pune results.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

finalCheck();
