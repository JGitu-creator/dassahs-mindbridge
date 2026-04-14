import { NextRequest, NextResponse } from 'next/server';
import * as mammoth from 'mammoth';
import pdf from 'pdf-parse';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';

    if (file.name.endsWith('.pdf')) {
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.name.endsWith('.docx')) {
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

    return NextResponse.json({ text: text.slice(0, 25000) });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: `Parsing Failed: ${error.message}` }, { status: 500 });
  }
}
