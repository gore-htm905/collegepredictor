const fs = require('fs');
const pdfjs = require('pdfjs-dist');

const CATEGORIES = [
    "GOPENS", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "EWS", "TFWS",
    "LOPENS", "LSCS", "LSTS", "LVJS", "LNT1S", "LNT2S", "LNT3S", "LOBCS",
    "GOPENH", "GSCH", "GSTH", "GVJH", "GNT1H", "GNT2H", "GNT3H", "GOBCH",
    "LOPENH", "LSCH", "LSTH", "LVJH", "LNT1H", "LNT2H", "LNT3H", "LOBCH",
    "GOPENO", "GSCO", "GSTO", "GVJO", "GNT1O", "GNT2O", "GNT3O", "GOBCO",
    "LOPENO", "LSCO", "LSTO", "LVJO", "LNT1O", "LNT2O", "LNT3O", "LOBCO",
    "ORPHAN", "PWDOPENH", "PWDSCH", "PWDSTH", "PWDVJH", "PWDNT1H", "PWDNT2H", "PWDNT3H", "PWDOBCH",
    "DEFOPENH", "DEFSCH", "DEFSTH", "DEFVJH", "DEFNT1H", "DEFNT2H", "DEFNT3H", "DEFOBCH"
];

async function debugExtraction() {
    const pdfPath = './server/data/official_cutoff_repaired.pdf';
    if (!fs.existsSync(pdfPath)) return;

    const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data: dataBuffer });
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    const linesMap = {};
    items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!linesMap[y]) linesMap[y] = [];
        linesMap[y].push(item);
    });

    const sortedY = Object.keys(linesMap).sort((a, b) => b - a);
    let dump = "";

    for (let j = 0; j < sortedY.length; j++) {
        const y = sortedY[j];
        const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);

        const words = [];
        let currentWord = null;

        lineItems.forEach(item => {
            const itStr = item.str;
            if (itStr.trim() === "" && itStr.length === 0) return;
            const itX = item.transform[4];
            const itWidth = item.width || 0;

            if (!currentWord || (itX - currentWord.endX) > 10) {
                if (currentWord) words.push(currentWord);
                currentWord = { str: itStr, x: itX, endX: itX + Math.max(itWidth, itStr.length * 5) };
            } else {
                currentWord.str += itStr;
                currentWord.endX = itX + Math.max(itWidth, itStr.length * 5);
            }
        });
        if (currentWord) words.push(currentWord);

        const lineStr = words.map(w => w.str).join(' ').trim();
        dump += `${y}: [LINE] "${lineStr}"\n`;
        dump += `     [WORDS] ${words.map(w => `"${w.str}"(x=${Math.round(w.x)})`).join(', ')}\n`;
    }

    fs.writeFileSync('./server/data/extraction_debug.txt', dump);
    console.log("Dumped extraction debug to ./server/data/extraction_debug.txt");
}

debugExtraction();
