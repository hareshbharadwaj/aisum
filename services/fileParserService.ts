// This service uses libraries loaded from CDN via script tags in index.html.
// We declare them on the window object to inform TypeScript about their existence.
declare global {
    interface Window {
        pdfjsLib: any;
        XLSX: any;
        JSZip: any;
    }
}

// Setup the PDF.js worker. This is required for it to work correctly.
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.mjs`;
}

const parseTxt = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject('Error reading text file.');
        };
        reader.readAsText(file);
    });
};

const parsePdf = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
        throw new Error('PDF processing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ');
        textContent += '\n\n'; // Add space between pages
    }
    return textContent;
};

const parseXlsx = async (file: File): Promise<string> => {
    if (!window.XLSX) {
        throw new Error('Excel processing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(arrayBuffer, { type: 'buffer' });
    let textContent = '';
    workbook.SheetNames.forEach((sheetName: string) => {
        textContent += `Sheet: ${sheetName}\n\n`;
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        jsonData.forEach((row: any) => {
            textContent += row.join('\t') + '\n';
        });
        textContent += '\n';
    });
    return textContent;
};

const parsePptx = async (file: File): Promise<string> => {
    if (!window.JSZip) {
        throw new Error('PowerPoint processing library is not loaded.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const slidePromises: Promise<string>[] = [];

    // Find all slide XML files
    zip.folder('ppt/slides')?.forEach((relativePath, file) => {
        if (relativePath.startsWith('slide') && relativePath.endsWith('.xml')) {
            slidePromises.push(file.async('string'));
        }
    });
    
    const slideXmls = await Promise.all(slidePromises);
    let textContent = '';
    const parser = new DOMParser();

    slideXmls.forEach((xmlString, index) => {
        textContent += `--- Slide ${index + 1} ---\n`;
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        const textNodes = xmlDoc.getElementsByTagName('a:t');
        for (let i = 0; i < textNodes.length; i++) {
            textContent += textNodes[i].textContent + ' ';
        }
        textContent += '\n\n';
    });

    return textContent;
};

export const parseFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return parseTxt(file);
    }
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return parsePdf(file);
    }
    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileName.endsWith('.xlsx')) {
        return parseXlsx(file);
    }
    if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileName.endsWith('.pptx')) {
        return parsePptx(file);
    }

    throw new Error('Unsupported file type.');
};
