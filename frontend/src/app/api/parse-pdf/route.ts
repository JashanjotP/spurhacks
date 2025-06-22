// src/app/api/parse-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const data = await pdfParse(buffer);
    return NextResponse.json({ text: data.text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
