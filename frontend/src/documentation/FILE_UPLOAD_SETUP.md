# File Processing Setup Guide

This guide explains how to set up the file processing system for the AI voice agent onboarding.

## Overview

The system allows users to upload documents during onboarding, which are then:
1. Text content extracted using pdf-parse (for PDFs) and other methods
2. Document records created in the `documents` table
3. Text chunks created and stored in the `document_chunks` table
4. Basic text search functionality available

## Database Setup

### 1. Run the Documents Schema
Execute the documents schema to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/documents.sql
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase configuration (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Processing Flow

1. **User uploads files** during onboarding
2. **Text content extracted** using pdf-parse for PDFs and other methods for different file types
3. **Document records** are created in the `documents` table
4. **Text chunks** are created and stored in the `document_chunks` table
5. **Basic search** becomes available for the business

## File Types Supported

- **PDF** (.pdf) - Uses pdf-parse for text extraction
- **Word Documents** (.doc, .docx) - Attempts text extraction
- **Text Files** (.txt) - Direct text reading

## Database Schema

### documents table
- `id`: UUID primary key
- `user_id`: References auth.users
- `business_id`: Business identifier
- `filename`: Original filename
- `file_type`: File MIME type
- `file_size`: File size in bytes
- `content`: Extracted text content (full document)
- `uploaded_at`: Upload timestamp
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

### document_chunks table
- `id`: UUID primary key
- `document_id`: References documents
- `user_id`: References auth.users
- `business_id`: Business identifier
- `chunk_index`: Position in document
- `content`: Text chunk content
- `metadata`: JSON metadata (chunk size, total chunks, etc.)
- `created_at`: Record creation timestamp

## Usage Examples

### Process Files During Onboarding
```typescript
import { fileUploadService } from '@/lib/supabase/file-upload-service';

// Files are automatically processed when onboarding completes
const processedFiles = await fileUploadService.uploadFiles(files, businessId);
```

### Search Documents
```typescript
import { documentService } from '@/lib/supabase/document-service';

const searchResults = await documentService.searchDocuments(
  "business hours",
  businessId,
  5
);
```

### Search Chunks
```typescript
const chunkResults = await documentService.searchChunks(
  "specific query",
  businessId,
  10
);
```

### Get Document Stats
```typescript
const stats = await documentService.getDocumentStats(businessId);
console.log(`Total documents: ${stats.totalDocuments}`);
console.log(`Total chunks: ${stats.totalChunks}`);
console.log(`Total size: ${stats.totalSize} bytes`);
```

## Text Extraction Details

### PDF Processing
- Uses `pdf-parse` library for text extraction
- Handles various PDF formats and layouts
- Extracts all text content from PDF files

### Text Chunking
- Content is split into chunks of 1000 characters with 200 character overlap
- Each chunk is stored separately for efficient searching
- Metadata includes chunk information and original filename

### Error Handling
- Unsupported file types return empty content
- PDF parsing errors are logged and handled gracefully
- Processing continues even if some files fail

## Search Functionality

The system provides multiple search options:
- **Document Search**: Searches through document filenames and full content
- **Chunk Search**: Searches through individual text chunks
- **Business-Specific**: All searches are scoped to the user's business
- **User-Specific**: All searches respect RLS policies

## Row Level Security (RLS)

The system includes proper RLS policies:
- Users can only access their own documents and chunks
- All database operations include user_id filtering
- Proper authentication checks for all operations

## Troubleshooting

### Common Issues:

1. **PDF parsing fails**
   - Check that pdf-parse is installed
   - Verify PDF file is not corrupted
   - Check file size limits

2. **Processing failures**
   - Verify file size limits (10MB)
   - Check supported file types
   - Ensure user is authenticated
   - Check RLS policies are in place

3. **Database errors**
   - Run the documents schema script
   - Check RLS policies
   - Verify table permissions
   - Ensure user_id is included in inserts

4. **Chunk creation fails**
   - Check document_chunks table exists
   - Verify foreign key relationships
   - Check RLS policies for chunks table

## Performance Considerations

- Large PDFs may take longer to process
- Text chunking improves search performance
- Database indexes optimize query performance
- RLS policies ensure data security

## Next Steps

1. Implement better text extraction for Word documents
2. Add file preview functionality
3. Implement advanced search with full-text indexing
4. Add document versioning
5. Implement bulk processing capabilities 