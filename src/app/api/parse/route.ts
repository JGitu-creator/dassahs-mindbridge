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

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.name.endsWith('.pdf')) {
      // DYNAMIC REQUIRE to prevent build-time crashes
      const pdf = require('pdf-parse');
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString('utf-8');
    }

    // Clean jargon and excessive spacing
    text = text.replace(/[^\x20-\x7E\n\t]/g, ' ');
    text = text.replace(/\s\s+/g, ' ').trim();

    return NextResponse.json({ text: text.slice(0, 15000) });
  } catch (error: any) {
    console.error('Parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 });
  }
}
