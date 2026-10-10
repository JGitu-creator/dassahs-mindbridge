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

    const fileName = file.name.toLowerCase();
    const allowedExtension = /\.(pdf|docx|txt|csv)$/i.test(fileName);
    const allowedMime = !file.type || ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'].includes(file.type);
    const maxBytes = 10 * 1024 * 1024;
    if (!allowedExtension || !allowedMime) {
      return NextResponse.json({ error: 'Unsupported document type. Please upload a PDF, DOCX, TXT, or CSV file.' }, { status: 415 });
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'This document is larger than 10 MB. Please split it into smaller parts.' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';

    if (fileName.endsWith('.pdf')) {
      try {
        // Use standard pdf-parse with direct buffer to avoid worker issues
        const pdf = require('pdf-parse');
        const data = await pdf(buffer);
        text = data.text;
      } catch (pdfErr: any) {
        console.error('PDF Parse Error:', pdfErr);
        throw new Error(`PDF Parsing failed: ${pdfErr.message}`);
      }
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
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

    return NextResponse.json({ text: text.slice(0, 100000) });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: `Parsing Failed: ${error.message}` }, { status: 500 });
  }
}
