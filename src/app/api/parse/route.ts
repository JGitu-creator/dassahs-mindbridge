import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.name.endsWith('.pdf')) {
      const loadingTask = getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pageTexts = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        pageTexts.push(pageText);
      }
      text = pageTexts.join('\n\n');

    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString('utf-8');
    }

    // Advanced Clean-up for ADHD focus
    text = text.replace(/[^\x20-\x7E\n\t]/g, ' '); // Remove weird characters
    text = text.replace(/\n\s*\n/g, '\n\n'); // Keep double newlines but clean empty space
    text = text.replace(/[ \t]+/g, ' '); // Single spaces only
    text = text.trim();

    return NextResponse.json({ text: text.slice(0, 20000) });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: `Failed to parse document: ${error.message}` }, { status: 500 });
  }
}

