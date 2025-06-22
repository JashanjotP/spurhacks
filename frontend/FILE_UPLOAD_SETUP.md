# File Upload and Vector Processing Setup Guide

This guide explains how to set up the complete file upload and vector processing system for the AI voice agent onboarding.

## Overview

The system allows users to upload documents during onboarding, which are then:
1. Stored in Supabase Storage
2. Processed into text chunks
3. Converted to vector embeddings using Gemini
4. Stored in the `document_chunks` table for similarity search

## Database Setup

### 1. Run the Documents Schema
Execute the documents schema to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/documents.sql
```

### 2. Run the Vector Search Function
Create the vector similarity search function:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/vector-search.sql
```

### 3. Set Up Storage Bucket
Create the storage bucket for documents:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/storage-setup.sql
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Gemini API Key for embeddings
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase configuration (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Routes

The system includes these API routes:

### `/api/documents/process`
- Processes uploaded documents
- Chunks text into smaller pieces
- Generates vector embeddings using Gemini
- Stores chunks in `document_chunks` table

### `/api/documents/search`
- Searches through document chunks using vector similarity
- Uses the `match_document_chunks` PostgreSQL function
- Returns relevant chunks based on semantic similarity

## File Upload Flow

1. **User uploads files** during onboarding
2. **Files are stored** in Supabase Storage under `documents/{businessId}/{filename}`
3. **Document records** are created in the `documents` table
4. **Text content** is extracted from files
5. **Content is chunked** into smaller pieces (1000 chars with 200 char overlap)
6. **Each chunk** is converted to a vector embedding using Gemini
7. **Chunks and embeddings** are stored in `document_chunks` table
8. **Vector similarity search** becomes available for the business

## File Types Supported

- **PDF** (.pdf)
- **Word Documents** (.doc, .docx)
- **Text Files** (.txt)

## Storage Structure

```
Supabase Storage:
documents/
├── {businessId}/
│   ├── document1.pdf
│   ├── document2.docx
│   └── document3.txt
```

## Database Schema

### documents table
- `id`: UUID primary key
- `user_id`: References auth.users
- `business_id`: Business identifier
- `filename`: Original filename
- `file_type`: File MIME type
- `file_size`: File size in bytes
- `content`: Extracted text content
- `uploaded_at`: Upload timestamp

### document_chunks table
- `id`: UUID primary key
- `document_id`: References documents
- `user_id`: References auth.users
- `business_id`: Business identifier
- `chunk_index`: Position in document
- `content`: Text chunk content
- `embedding`: Vector embedding (1536 dimensions)
- `metadata`: JSON metadata (chunk size, total chunks, etc.)

## Usage Examples

### Upload Files During Onboarding
```typescript
import { fileUploadService } from '@/lib/supabase/file-upload-service';

// Files are automatically uploaded when onboarding completes
const uploadedFiles = await fileUploadService.uploadFiles(files, businessId);
```

### Search Documents
```typescript
import { documentService } from '@/lib/supabase/document-service';

const searchResults = await documentService.searchDocuments(
  "What are your business hours?",
  businessId,
  5
);
```

### Get Document Stats
```typescript
const stats = await documentService.getDocumentStats(businessId);
console.log(`Total documents: ${stats.totalDocuments}`);
console.log(`Total chunks: ${stats.totalChunks}`);
```

## Vector Search Details

- **Embedding Model**: Gemini `embedding-001` (1536 dimensions)
- **Similarity Metric**: Cosine similarity
- **Chunk Size**: 1000 characters with 200 character overlap
- **Search Threshold**: 0.7 (70% similarity)
- **Results Limit**: Configurable (default 5)

## Error Handling

The system includes comprehensive error handling:
- File upload failures don't block onboarding completion
- Vector processing errors are logged but don't fail the upload
- Storage and database operations are atomic
- Graceful fallbacks for missing dependencies

## Performance Considerations

- Large files are automatically chunked to prevent embedding size limits
- Vector search uses PostgreSQL's pgvector extension for efficient similarity search
- Storage policies ensure users can only access their own documents
- Embeddings are generated asynchronously to avoid blocking the UI

## Troubleshooting

### Common Issues

1. **Vector processing fails**: Check GEMINI_API_KEY is set correctly
2. **Storage upload fails**: Verify storage bucket exists and policies are set
3. **Search returns no results**: Check if documents were processed successfully
4. **Permission errors**: Ensure RLS policies are properly configured

### Debug Logs

Enable debug logging by checking the browser console and server logs:
- File upload progress
- Vector processing status
- Search query results
- Error details and stack traces 