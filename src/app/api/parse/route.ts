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
    const allowedExtension = /\.(pdf|docx|txt|csv|md)$/i.test(fileName);
    const allowedMime = !file.type || [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'text/markdown',
      'application/octet-stream',
    ].includes(file.type);
    const maxBytes = 10 * 1024 * 1024;
    if (!allowedExtension || !allowedMime) {
      return NextResponse.json({ error: 'Unsupported document type. Upload a PDF, DOCX, TXT, MD, CSV, or an image (PNG/JPG/WEBP).' }, { status: 415 });
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'This document is larger than 10 MB. Split it into smaller parts or paste a section directly.' }, { status: 413 });
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
        return NextResponse.json(
          { error: 'Could not read this PDF. If it is password-protected or corrupted, copy the text or upload a screenshot instead.' },
          { status: 422 }
        );
      }
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No selectable text was found in this file. If it is a scanned PDF, take a screenshot or upload it as an image (PNG/JPG) so Prism can read it.' },
        { status: 422 }
      );
    }

    // Preserve UTF-8 punctuation and international characters while removing control chars.
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    text = text.trim();

    return NextResponse.json({ text: text.slice(0, 100000) });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: `Could not process this file: ${error.message || 'Please try pasting the text directly.'}` }, { status: 500 });
  }
}
