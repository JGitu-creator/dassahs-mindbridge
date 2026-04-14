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
    let text = '';

    if (file.name.endsWith('.pdf')) {
      // Use dynamic require for pdf-parse to avoid ESM/Next.js issues
      const pdf = require('pdf-parse');
      const data = await pdf(Buffer.from(arrayBuffer));
      text = data.text;

    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      text = result.value;
    } else {
      text = Buffer.from(arrayBuffer).toString('utf-8');
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

