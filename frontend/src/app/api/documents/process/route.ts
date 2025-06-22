import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to chunk text into smaller pieces
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }
  
  return chunks;
}

// Function to generate embeddings using Gemini
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`🎯 API: Starting embedding generation for text length: ${text.length}`);
    const startTime = Date.now();
    
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    console.log(`🤖 API: Gemini model initialized`);
    
    const result = await model.embedContent(text);
    console.log(`📡 API: Gemini API call completed`);
    
    const embedding = await result.embedding;
    const endTime = Date.now();
    console.log(`✅ API: Embedding generated in ${endTime - startTime}ms, dimensions: ${embedding.values.length}`);
    
    return embedding.values;
  } catch (error) {
    console.error('❌ API: Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`🚀 API: Starting document processing...`);
  
  try {
    const { documentId, content, businessId } = await request.json();
    console.log(`📋 API: Received request for document ${documentId}`);
    console.log(`📊 API: Content length: ${content?.length || 0} characters`);
    console.log(`🏢 API: Business ID: ${businessId}`);
    
    if (!documentId || !content || !businessId) {
      console.error(`❌ API: Missing required fields`);
      return NextResponse.json(
        { error: 'Missing required fields: documentId, content, businessId' },
        { status: 400 }
      );
    }

    console.log(`🔐 API: Creating Supabase client...`);
    const supabase = await createClient();
    
    // Get the current user
    console.log(`👤 API: Getting current user...`);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(`❌ API: User authentication failed:`, userError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`✅ API: User authenticated: ${user.id}`);

    // Clean and prepare the content
    console.log(`🧹 API: Cleaning content...`);
    const cleanContent = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .trim();

    if (cleanContent.length === 0) {
      console.error(`❌ API: Content is empty after cleaning`);
      return NextResponse.json(
        { error: 'Document content is empty' },
        { status: 400 }
      );
    }
    console.log(`✅ API: Content cleaned, length: ${cleanContent.length}`);

    // Chunk the content
    console.log(`✂️ API: Chunking content...`);
    const chunks = chunkText(cleanContent);
    console.log(`📦 API: Created ${chunks.length} chunks`);

    // Process each chunk and create embeddings
    console.log(`🧠 API: Starting vector processing for ${chunks.length} chunks...`);
    const chunkPromises = chunks.map(async (chunk, index) => {
      try {
        console.log(`🔢 API: Processing chunk ${index + 1}/${chunks.length}...`);
        
        // Generate embedding for the chunk
        console.log(`🎯 API: Generating embedding for chunk ${index + 1}...`);
        const embeddingStartTime = Date.now();
        const embedding = await generateEmbedding(chunk);
        const embeddingTime = Date.now() - embeddingStartTime;
        console.log(`⏱️ API: Embedding generated in ${embeddingTime}ms for chunk ${index + 1}`);
        
        // Store chunk with embedding in database
        console.log(`💾 API: Storing chunk ${index + 1} in database...`);
        const dbStartTime = Date.now();
        const { data: chunkData, error: chunkError } = await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            user_id: user.id,
            business_id: businessId,
            chunk_index: index,
            content: chunk,
            embedding: embedding,
            metadata: {
              chunk_size: chunk.length,
              total_chunks: chunks.length,
              chunk_index: index,
            }
          })
          .select()
          .single();

        const dbTime = Date.now() - dbStartTime;
        console.log(`⏱️ API: Database insert took ${dbTime}ms for chunk ${index + 1}`);

        if (chunkError) {
          console.error(`❌ API: Error inserting chunk ${index + 1}:`, chunkError);
          throw chunkError;
        }

        console.log(`✅ API: Chunk ${index + 1} processed successfully`);
        return chunkData;
      } catch (error) {
        console.error(`❌ API: Error processing chunk ${index + 1}:`, error);
        throw error;
      }
    });

    // Wait for all chunks to be processed
    console.log(`⏳ API: Waiting for all chunks to complete...`);
    const processedChunks = await Promise.all(chunkPromises);

    const totalTime = Date.now() - startTime;
    console.log(`🎊 API: Successfully processed ${processedChunks.length} chunks in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      documentId,
      chunksProcessed: processedChunks.length,
      processingTime: totalTime,
      message: 'Document processed successfully'
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ API: Error processing document after ${totalTime}ms:`, error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 