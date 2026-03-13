const fs = require('fs');
const pdfjs = require('pdfjs-dist');

async function debugPdf() {
    const pdfPath = './server/data/official_cutoff_repaired.pdf';
    if (!fs.existsSync(pdfPath)) return;

    const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjs.getDocument({ data: dataBuffer });
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();

    console.log("--- ALL ITEMS ON PAGE 1 ---");
    textContent.items.forEach(it => {
        console.log(`"${it.str}" (x=${it.transform[4]}, y=${it.transform[5]})`);
    });
}

debugPdf();
