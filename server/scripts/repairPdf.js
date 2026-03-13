const fs = require('fs');

async function repairPdf() {
    const htmlPath = './server/data/official_cutoff.pdf';
    const pdfPath = './server/data/official_cutoff_repaired.pdf';

    console.log("Reading HTML file...");
    const html = fs.readFileSync(htmlPath, 'utf8');

    console.log("Searching for LoadPublicDocument pattern...");
    // The pattern is LoadPublicDocument('BASE64_STUFF')
    const match = html.match(/LoadPublicDocument\('([^']+)'\)/);

    if (match && match[1]) {
        console.log("Found base64 PDF data (length: " + match[1].length + "). Saving...");
        const buffer = Buffer.from(match[1], 'base64');
        fs.writeFileSync(pdfPath, buffer);
        console.log("Repaired PDF saved to:", pdfPath);
    } else {
        console.error("Could not find LoadPublicDocument pattern.");
        // Check for other potential patterns the browser subagent might have seen
        const altMatch = html.match(/base64\s*,\s*([^'"]+)/);
        if (altMatch) {
            console.log("Found alternative base64 pattern. Saving...");
            const buffer = Buffer.from(altMatch[1], 'base64');
            fs.writeFileSync(pdfPath, buffer);
        } else {
            console.log("First 2000 chars of HTML for debug:");
            console.log(html.substring(0, 2000));
            console.log("Last 2000 chars of HTML for debug:");
            console.log(html.substring(html.length - 2000));
        }
    }
}

repairPdf();
