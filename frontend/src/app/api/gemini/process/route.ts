import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { text, filename } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Process text with Gemini
    const processedText = await processTextWithGemini(text, filename);
    
    // Generate embedding with Gemini
    const embedding = await generateEmbedding(text);

    return NextResponse.json({
      success: true,
      processedText,
      embedding,
    });

  } catch (error) {
    console.error('Gemini processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process with Gemini' },
      { status: 500 }
    );
  }
}

async function processTextWithGemini(text: string, filename: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Please process and clean the following text extracted from "${filename}". 
    Your task is to:
    1. Remove any unnecessary formatting or artifacts
    2. Organize the content logically
    3. Preserve important information like contact details, business information, policies, etc.
    4. Make the text more readable and structured
    5. Keep all factual information intact
    6. If the text is already clean and well-structured, return it as is
    
    Text to process:
    ${text}
    
    Return only the cleaned and processed text without any additional commentary.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini text processing error:', error);
    // Fallback to original text if Gemini fails
    return text;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Gemini embedding model
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-exp-03-07' });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    return embedding.values;
  } catch (error) {
    console.error('Gemini embedding error:', error);
    // Fallback: return a zero vector (not ideal but prevents crashes)
    return new Array(768).fill(0); // Gemini embedding dimension
  }
} 