import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

interface FileData {
  id: string;
  filename: string;
  processedContent: string;
  embedding: number[];
}

export async function POST(request: NextRequest) {
  try {
    const { query, files } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'Files array is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Calculate similarity scores
    const results = await calculateSimilarity(query, queryEmbedding, files);

    return NextResponse.json({
      success: true,
      results,
      query,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
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
    // Fallback: return a zero vector
    return new Array(768).fill(0);
  }
}

async function calculateSimilarity(
  query: string, 
  queryEmbedding: number[], 
  files: FileData[]
): Promise<FileData[]> {
  try {
    // Calculate cosine similarity between query and each file
    const similarities = files.map(file => {
      const similarity = cosineSimilarity(queryEmbedding, file.embedding);
      return {
        ...file,
        similarity,
      };
    });

    // Sort by similarity (highest first) and filter out low similarity results
    const sortedResults = similarities
      .filter(result => result.similarity > 0.1) // Minimum similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Return top 5 results

    return sortedResults;
  } catch (error) {
    console.error('Similarity calculation error:', error);
    return [];
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
} 