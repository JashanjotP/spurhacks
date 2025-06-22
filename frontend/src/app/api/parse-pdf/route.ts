import pdfParse from 'pdf-parse/lib/pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from '@supabase/supabase-js';
import { TaskType } from "@google/generative-ai";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const businessId = formData.get('businessId') as string;
    const userId = formData.get('userId') as string;
    const filename = formData.get('filename') as string;

    // Validate required fields
    if (!file || !businessId || !userId || !filename) {
      return NextResponse.json(
        { message: 'Missing required fields: file, businessId, userId, or filename' }, 
        { status: 400 }
      );
    }

    // Validate file type
    const fileType = file.type;
    if (fileType !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Only PDF files are supported' }, 
        { status: 400 }
      );
    }

    // Convert Blob to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF to extract text
    console.log('Parsing PDF...');
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { message: 'No text content found in PDF' }, 
        { status: 400 }
      );
    }

    // Split text into chunks
    console.log('Splitting text into chunks...');
    const splitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 250, 
      chunkOverlap: 50 
    });
    const chunks = await splitter.splitText(extractedText);

    if (chunks.length === 0) {
      return NextResponse.json(
        { message: 'No chunks generated from text' }, 
        { status: 400 }
      );
    }

    // Initialize Gemini embeddings
    console.log('Initializing Gemini embeddings...');
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
      model: "text-embedding-005", // or "text-embedding-004" for newer model
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: filename
    });

    // First, insert the document record
    console.log('Inserting document record...');
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
      console.error('Error inserting document:', documentError);
      return NextResponse.json(
        { message: 'Failed to save document record' }, 
        { status: 500 }
      );
    }

    const documentId = documentData.id;
    console.log('Document inserted with ID:', documentId);

    // Generate embeddings for all chunks
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const chunkEmbeddings = await embeddings.embedDocuments(chunks);

    // Prepare chunk data for batch insertion
    const chunkData = chunks.map((chunk, index) => ({
      document_id: documentId,
      user_id: userId,
      business_id: businessId,
      chunk_index: index,
      content: chunk,
      embedding: `[${chunkEmbeddings[index].join(',')}]`, // Convert array to string format for PostgreSQL
      metadata: {
        filename: filename,
        chunkLength: chunk.length,
        totalChunks: chunks.length,
      },
    }));

    // Insert all chunks in batch
    console.log('Inserting document chunks...');
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkData);

    if (chunksError) {
      console.error('Error inserting chunks:', chunksError);
      // Try to clean up the document record if chunk insertion fails
      await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      return NextResponse.json(
        { message: 'Failed to save document chunks' }, 
        { status: 500 }
      );
    }

    console.log('Processing completed successfully');
    
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
    console.error('Error processing file:', error);
    
    // Return specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { message: 'Invalid or missing Google AI API key' }, 
          { status: 500 }
        );
      }
      if (error.message.includes('pdf-parse')) {
        return NextResponse.json(
          { message: 'Failed to parse PDF file. File may be corrupted or encrypted.' }, 
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error while processing file' }, 
      { status: 500 }
    );
  }
}

// Optional: Add a health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'PDF processing endpoint is healthy',
    supportedFileTypes: ['application/pdf'],
    maxFileSize: '10MB',
  });
}