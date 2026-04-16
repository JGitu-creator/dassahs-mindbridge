import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let text = '';

    if (file.name.endsWith('.pdf')) {
      try {
        // Use pdfjs-dist which is already in package.json and better for ESM/Vercel
        const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
        
        const loadingTask = pdfjs.getDocument({
          data: uint8Array,
          disableWorker: true,
          verbosity: 0
        });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item: any) => item.str);
          fullText += strings.join(' ') + '\n';
        }
        
        text = fullText;
      } catch (pdfErr: any) {
        console.error('PDF Parse Error:', pdfErr);
        throw new Error(`PDF Parsing failed: ${pdfErr.message}.`);
      }
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else {
      const buffer = Buffer.from(arrayBuffer);
      text = buffer.toString('utf-8');
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
    console.error('Parsing error:', error);
    return NextResponse.json({ error: `Parsing Failed: ${error.message}` }, { status: 500 });
  }
}
