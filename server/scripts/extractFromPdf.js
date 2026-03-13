const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// pdfjs-dist v4 ships only as ESM in the legacy folder; the main build still has
// a CommonJS-compatible wrapper.  We need to use a dynamic import trick.
let pdfjs;

// All MHT-CET category codes
const CATEGORY_SET = new Set([
    "GOPENS","GSCS","GSTS","GVJS","GNT1S","GNT2S","GNT3S","GOBCS","EWS","TFWS",
    "LOPENS","LSCS","LSTS","LVJS","LNT1S","LNT2S","LNT3S","LOBCS",
    "GOPENH","GSCH","GSTH","GVJH","GNT1H","GNT2H","GNT3H","GOBCH",
    "LOPENH","LSCH","LSTH","LVJH","LNT1H","LNT2H","LNT3H","LOBCH",
    "GOPENO","GSCO","GSTO","GVJO","GNT1O","GNT2O","GNT3O","GOBCO",
    "LOPENO","LSCO","LSTO","LVJO","LNT1O","LNT2O","LNT3O","LOBCO"
]);

const UNIVERSITY_REGION_MAP = {
    "Sant Gadge Baba Amravati University": "Vidarbha",
    "Dr. Babasaheb Ambedkar Marathwada University": "Marathwada",
    "Swami Ramanand Teerth Marathwada University, Nanded": "Marathwada",
    "Mumbai University": "Konkan",
    "Savitribai Phule Pune University": "Western Maharashtra",
    "Shivaji University": "Western Maharashtra",
    "Punyashlok Ahilyadevi Holkar Solapur University": "Western Maharashtra",
    "Kavayitri Bahinabai Chaudhari North Maharashtra University, Jalgaon": "Khandesh"
};

function buildLineMap(textContent) {
    const map = {};
    for (const item of textContent.items) {
        const y = Math.round(item.transform[5]);
        if (!map[y]) map[y] = [];
        map[y].push(item);
    }
    return map;
}

function joinLine(items) {
    const sorted = [...items].sort((a, b) => a.transform[4] - b.transform[4]);
    let text = '';
    let lastRight = -1;
    for (const it of sorted) {
        const x = it.transform[4];
        if (lastRight !== -1 && (x - lastRight) > 5) text += ' ';
        text += it.str;
        lastRight = x + (it.width || it.str.length * 4);
    }
    return text.trim();
}

async function extractPdfData(pdfPath, outputPath) {
    if (!fs.existsSync(pdfPath)) {
        console.error('PDF not found:', pdfPath);
        process.exit(1);
    }

    const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjs.getDocument({
        data: dataBuffer,
        useSystemFonts: true,
        stopAtErrors: false
    }).promise;
    console.log(`PDF loaded: ${pdf.numPages} pages`);

    const results = [];
    let currentInstitute = null;
    let currentBranch = null;
    let catHeaders = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const tc = await page.getTextContent();
        const lineMap = buildLineMap(tc);

        const sortedYs = Object.keys(lineMap)
            .map(Number)
            .sort((a, b) => b - a);

        for (const y of sortedYs) {
            const items = lineMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
            const lineStr = joinLine(items);
            const tokens = lineStr.split(/\s+/).filter(Boolean);

            // Institute header: 4-6 digit code followed by dash and name
            const instMatch = lineStr.match(/^(\d{4,6})\s*[-–]\s*(.+)/);
            if (instMatch) {
                const code = instMatch[1].trim();
                const rest = instMatch[2];
                const name = rest.split(/University|Home|State/i)[0].replace(/,\s*$/, '').trim();
                const cityParts = rest.split(',');
                const city = cityParts.length > 1 ? cityParts[cityParts.length - 1].split(/University|Home/i)[0].trim() : name;
                currentInstitute = { code, name, city, region: 'Other' };
                currentBranch = null;
                catHeaders = [];
                continue;
            }

            // University line → extract region
            const univMatch = lineStr.match(/University\s*[:\-–]\s*(.+)/i);
            if (univMatch && currentInstitute) {
                const uName = univMatch[1].split(/\d/)[0].trim();
                for (const [key, region] of Object.entries(UNIVERSITY_REGION_MAP)) {
                    if (uName.includes(key) || key.includes(uName)) {
                        currentInstitute.region = region;
                        break;
                    }
                }
                continue;
            }

            // Branch header: 6-12 digit code followed by dash and name
            const branchMatch = lineStr.match(/^(\d{6,12})\s*[-–]\s*(.+)/);
            if (branchMatch) {
                currentBranch = branchMatch[2]
                    .split(/Status|State Level|Home|University/i)[0]
                    .replace(/,\s*$/, '')
                    .trim();
                catHeaders = [];
                continue;
            }

            // Category header row: line contains >= 1 known category codes
            const catsOnLine = tokens.filter(t => CATEGORY_SET.has(t.toUpperCase()));
            if (catsOnLine.length >= 1) {
                const newHeaders = [];
                for (const item of items) {
                    const code = item.str.trim().toUpperCase();
                    if (CATEGORY_SET.has(code)) {
                        newHeaders.push({ code, x: item.transform[4] });
                    }
                }
                if (newHeaders.length > 0) {
                    catHeaders = newHeaders;
                }
                continue;
            }

            // Data row: contains parenthesised percentile values like "(98.12)"
            if (currentInstitute && currentBranch && catHeaders.length > 0) {
                const cutoffPattern = /\(\s*(\d{1,3}(?:\.\d+)?)\s*\)/g;
                let m;
                while ((m = cutoffPattern.exec(lineStr)) !== null) {
                    const pct = parseFloat(m[1]);
                    if (isNaN(pct) || pct < 1 || pct > 100) continue;

                    // Find X position of this match
                    let charPos = 0;
                    let matchX = null;
                    for (const it of items) {
                        const itEnd = charPos + it.str.length;
                        if (charPos <= m.index && m.index < itEnd + 2) {
                            matchX = it.transform[4];
                            break;
                        }
                        charPos += it.str.length + 1;
                    }
                    if (matchX === null) continue;

                    // Nearest category header by X distance
                    let best = null;
                    let bestDist = Infinity;
                    for (const h of catHeaders) {
                        const d = Math.abs(h.x - matchX);
                        if (d < bestDist) { bestDist = d; best = h; }
                    }

                    if (best && bestDist < 300) {
                        results.push({
                            instituteCode: currentInstitute.code,
                            instituteName: currentInstitute.name,
                            branch: currentBranch,
                            category: best.code,
                            gender: best.code.startsWith('L') ? 'L' : 'G',
                            percentile: pct,
                            city: currentInstitute.city,
                            region: currentInstitute.region,
                            capRound: 1
                        });
                    }
                }
            }
        }
    }

    console.log(`Extraction complete: ${results.length} records`);

    if (results.length > 0) {
        const writer = createCsvWriter({
            path: outputPath,
            header: [
                { id: 'instituteCode', title: 'instituteCode' },
                { id: 'instituteName', title: 'instituteName' },
                { id: 'branch',        title: 'branch' },
                { id: 'category',      title: 'category' },
                { id: 'gender',        title: 'gender' },
                { id: 'percentile',    title: 'percentile' },
                { id: 'city',          title: 'city' },
                { id: 'region',        title: 'region' },
                { id: 'capRound',      title: 'capRound' }
            ]
        });
        await writer.writeRecords(results);
        console.log('Saved to', outputPath);
    } else {
        console.warn('No records extracted. Check the PDF structure.');
    }
}

async function main() {
    // Dynamically import pdfjs-dist (ESM only in v4+)
    const mod = await import('pdfjs-dist');
    pdfjs = mod;

    const pdfPath    = process.argv[2];
    const outputPath = process.argv[3] || 'data/full_cutoffs.csv';

    if (!pdfPath) {
        console.error('Usage: node scripts/extractFromPdf.js <path/to/cutoff.pdf> [output.csv]');
        process.exit(1);
    }

    try {
        await extractPdfData(pdfPath, outputPath);
    } catch (err) {
        console.error('Extraction failed:', err.message);
        process.exit(1);
    }
}

main();
