import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Standard Node fix for pdfjs
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Parsing file: ${file.name} (${file.size} bytes)`);
    const arrayBuffer = await file.arrayBuffer();
    let text = '';

    if (file.name.endsWith('.pdf')) {
      const uint8Array = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true, // Crucial for serverless environments
      });
      
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(' ') + '\n\n';
      }
      text = fullText;

    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      text = result.value;
    } else {
      text = Buffer.from(arrayBuffer).toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      throw new Error("Extracted text is empty. The file might be scanned/image-only.");
    }

    // Advanced Clean-up for ADHD focus
    text = text.replace(/[^\x20-\x7E\n\t]/g, ' '); 
    text = text.replace(/\n\s*\n/g, '\n\n'); 
    text = text.replace(/[ \t]+/g, ' '); 
    text = text.trim();

    return NextResponse.json({ text: text.slice(0, 25000) });
  } catch (error: any) {
    console.error('Parsing error details:', error);
    return NextResponse.json({ error: `Parsing Failed: ${error.message}` }, { status: 500 });
  }
}

