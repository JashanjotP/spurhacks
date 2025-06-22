import pdfParse from 'pdf-parse/lib/pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from '@supabase/supabase-js';
import { TaskType } from "@google/generative-ai";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('🚀 PDF Processing API called');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  try {
    console.log('📋 Parsing form data...');
    const formData = await request.formData();
    
    console.log('🔍 Extracting form fields...');
    const file = formData.get('file') as Blob;
    const businessId = formData.get('businessId') as string;
    const userId = formData.get('userId') as string;
    const filename = formData.get('filename') as string;

    console.log('📊 Form data extracted:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      businessId,
      userId,
      filename
    });

    // Validate required fields
    console.log('✅ Validating required fields...');
    if (!file || !businessId || !userId || !filename) {
      console.error('❌ Missing required fields:', {
        hasFile: !!file,
        hasBusinessId: !!businessId,
        hasUserId: !!userId,
        hasFilename: !!filename
      });
      return NextResponse.json(
        { message: 'Missing required fields: file, businessId, userId, or filename' }, 
        { status: 400 }
      );
    }
    console.log('✅ All required fields present');

    // Validate userId is a valid UUID format
    console.log('🔍 Validating userId format...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return NextResponse.json(
        { message: 'Invalid user ID format. User must be authenticated.' }, 
        { status: 400 }
      );
    }
    console.log('✅ User ID format validation passed');

    // Validate file type
    console.log('🔍 Validating file type...');
    const fileType = file.type;
    console.log('📄 File type:', fileType);
    
    if (fileType !== 'application/pdf') {
      console.error('❌ Invalid file type:', fileType);
      return NextResponse.json(
        { message: 'Only PDF files are supported' }, 
        { status: 400 }
      );
    }
    console.log('✅ File type validation passed');

    // Convert Blob to ArrayBuffer then to Buffer
    console.log('🔄 Converting file to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('📦 ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    
    const buffer = Buffer.from(arrayBuffer);
    console.log('📦 Buffer size:', buffer.length, 'bytes');

    // Parse PDF to extract text
    console.log('📖 Starting PDF parsing...');
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;
    
    console.log('📊 PDF parsing results:', {
      textLength: extractedText?.length || 0,
      hasText: !!extractedText,
      pdfInfo: {
        pages: pdfData.numpages,
        info: pdfData.info
      }
    });

    if (!extractedText || extractedText.trim().length === 0) {
      console.error('❌ No text content found in PDF');
      return NextResponse.json(
        { message: 'No text content found in PDF' }, 
        { status: 400 }
      );
    }
    console.log('✅ Text extraction successful');

    // Split text into chunks
    console.log('✂️ Starting text chunking...');
    const splitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 250, 
      chunkOverlap: 50 
    });
    const chunks = await splitter.splitText(extractedText);

    console.log('📦 Chunking results:', {
      totalChunks: chunks.length,
      averageChunkSize: chunks.length > 0 ? Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length) : 0,
      firstChunkPreview: chunks[0]?.substring(0, 100) + '...',
      lastChunkPreview: chunks[chunks.length - 1]?.substring(0, 100) + '...'
    });

    if (chunks.length === 0) {
      console.error('❌ No chunks generated from text');
      return NextResponse.json(
        { message: 'No chunks generated from text' }, 
        { status: 400 }
      );
    }
    console.log('✅ Text chunking successful');

    // Initialize Gemini embeddings
    console.log('🤖 Initializing Gemini embeddings...');
    console.log('🔑 API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('🔑 API Key length:', process.env.GEMINI_API_KEY?.length || 0);
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY!,
      model: "text-embedding-004", // Use the newer model
    });
    console.log('✅ Gemini embeddings initialized');

    // Test embedding generation with a simple text first
    console.log('🧪 Testing embedding generation...');
    try {
      const testEmbedding = await embeddings.embedQuery("test");
      console.log('✅ Test embedding successful, dimensions:', testEmbedding.length);
    } catch (testError) {
      console.error('❌ Test embedding failed:', testError);
      return NextResponse.json(
        { message: 'Failed to generate test embedding. Please check your Gemini API key.' }, 
        { status: 500 }
      );
    }

    // First, insert the document record
    console.log('💾 Inserting document record into database...');
    console.log('📝 Document data:', {
      user_id: userId,
      business_id: businessId,
      filename: filename,
      file_type: fileType,
      file_size: file.size,
      content_length: extractedText.length
    });
    
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        business_id: businessId,
        filename: filename,
        file_type: fileType,
        file_size: file.size,
        content: extractedText,
      })
      .select('id')
      .single();

    if (documentError || !documentData) {
      console.error('❌ Error inserting document:', documentError);
      console.error('📋 Error details:', {
        code: documentError?.code,
        message: documentError?.message,
        details: documentError?.details,
        hint: documentError?.hint
      });
      return NextResponse.json(
        { message: 'Failed to save document record' }, 
        { status: 500 }
      );
    }

    const documentId = documentData.id;
    console.log('✅ Document inserted successfully with ID:', documentId);

    // Generate embeddings for all chunks
    console.log(`🧠 Generating embeddings for ${chunks.length} chunks...`);
    console.log('📝 Sample chunk content:', chunks[0]?.substring(0, 100) + '...');
    const startTime = Date.now();
    
    try {
      const chunkEmbeddings = await embeddings.embedDocuments(chunks);
      const embeddingTime = Date.now() - startTime;
      
      console.log('🧠 Embeddings generated:', {
        chunksProcessed: chunkEmbeddings.length,
        embeddingDimensions: chunkEmbeddings[0]?.length || 0,
        processingTime: `${embeddingTime}ms`,
        averageTimePerChunk: `${Math.round(embeddingTime / chunks.length)}ms`
      });

      // Debug: Log first embedding details
      if (chunkEmbeddings[0]) {
        console.log('🔍 First embedding details:', {
          length: chunkEmbeddings[0].length,
          firstFewValues: chunkEmbeddings[0].slice(0, 5),
          isArray: Array.isArray(chunkEmbeddings[0]),
          type: typeof chunkEmbeddings[0]
        });
      }

      // Validate embeddings
      if (!chunkEmbeddings || chunkEmbeddings.length === 0) {
        throw new Error('No embeddings generated');
      }

      if (chunkEmbeddings[0] && chunkEmbeddings[0].length === 0) {
        throw new Error('Embeddings are empty arrays');
      }

      // Prepare chunk data for batch insertion
      console.log('📦 Preparing chunk data for database insertion...');
      const chunkData = chunks.map((chunk, index) => {
        const embedding = chunkEmbeddings[index];
        if (!embedding || embedding.length === 0) {
          throw new Error(`Empty embedding for chunk ${index}`);
        }
        
        return {
          document_id: documentId,
          user_id: userId,
          business_id: businessId,
          chunk_index: index,
          content: chunk,
          embedding: embedding, // Pass the array directly - Supabase will handle the conversion
          metadata: {
            filename: filename,
            chunkLength: chunk.length,
            totalChunks: chunks.length,
          },
        };
      });

      console.log('📦 Chunk data prepared:', {
        totalChunks: chunkData.length,
        sampleChunk: {
          document_id: chunkData[0]?.document_id,
          chunk_index: chunkData[0]?.chunk_index,
          content_length: chunkData[0]?.content?.length,
          embedding_length: chunkData[0]?.embedding?.length
        }
      });

      // Insert all chunks in batch
      console.log('💾 Inserting document chunks into database...');
      const chunksStartTime = Date.now();
      const { error: chunksError } = await supabase
        .from('document_chunks')
        .insert(chunkData);
      const chunksTime = Date.now() - chunksStartTime;

      if (chunksError) {
        console.error('❌ Error inserting chunks:', chunksError);
        console.error('📋 Chunks error details:', {
          code: chunksError.code,
          message: chunksError.message,
          details: chunksError.details,
          hint: chunksError.hint
        });
        
        // Try to clean up the document record if chunk insertion fails
        console.log('🧹 Cleaning up document record due to chunk insertion failure...');
        const { error: cleanupError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentId);
        
        if (cleanupError) {
          console.error('❌ Failed to cleanup document record:', cleanupError);
        } else {
          console.log('✅ Document record cleaned up successfully');
        }
        
        return NextResponse.json(
          { message: 'Failed to save document chunks' }, 
          { status: 500 }
        );
      }

      console.log('✅ Chunks inserted successfully:', {
        chunksInserted: chunkData.length,
        insertionTime: `${chunksTime}ms`
      });

    } catch (embeddingError) {
      console.error('❌ Error generating embeddings:', embeddingError);
      
      // Clean up the document record
      console.log('🧹 Cleaning up document record due to embedding failure...');
      const { error: cleanupError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (cleanupError) {
        console.error('❌ Failed to cleanup document record:', cleanupError);
      } else {
        console.log('✅ Document record cleaned up successfully');
      }
      
      return NextResponse.json(
        { message: 'Failed to generate embeddings for document chunks' }, 
        { status: 500 }
      );
    }

    console.log('🎉 Processing completed successfully!');
    console.log('📊 Final summary:', {
      documentId: documentId,
      filename: filename,
      chunksCreated: chunks.length,
      totalCharacters: extractedText.length,
      fileSize: file.size,
      totalProcessingTime: `${Date.now() - startTime}ms`
    });
    
    return NextResponse.json({
      message: 'File processed and saved successfully',
      data: {
        documentId: documentId,
        filename: filename,
        chunksCreated: chunks.length,
        totalCharacters: extractedText.length,
        fileSize: file.size,
      }
    });

  } catch (error) {
    console.error('💥 Error processing file:', error);
    console.error('📋 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('🔑 Google AI API key error detected');
        return NextResponse.json(
          { message: 'Invalid or missing Google AI API key' }, 
          { status: 500 }
        );
      }
      if (error.message.includes('pdf-parse')) {
        console.error('📄 PDF parsing error detected');
        return NextResponse.json(
          { message: 'Failed to parse PDF file. File may be corrupted or encrypted.' }, 
          { status: 400 }
        );
      }
    }
    
    console.error('❌ Returning generic error response');
    return NextResponse.json(
      { message: 'Internal server error while processing file' }, 
      { status: 500 }
    );
  }
}

// Optional: Add a health check endpoint
export async function GET() {
  console.log('🏥 Health check endpoint called');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  // Check database schema
  let schemaStatus = 'unknown';
  try {
    const { data, error } = await supabase
      .from('document_chunks')
      .select('embedding')
      .limit(1);
    
    if (error) {
      schemaStatus = `error: ${error.message}`;
    } else {
      schemaStatus = 'embedding column exists';
    }
  } catch (err) {
    schemaStatus = `exception: ${err instanceof Error ? err.message : 'unknown'}`;
  }
  
  const healthData = {
    message: 'PDF processing endpoint is healthy',
    supportedFileTypes: ['application/pdf'],
    maxFileSize: '10MB',
    timestamp: new Date().toISOString(),
    database: {
      schema: schemaStatus,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    environment: {
      hasGoogleAIKey: !!process.env.GEMINI_API_KEY
    }
  };
  
  console.log('🏥 Health check response:', healthData);
  return NextResponse.json(healthData);
}