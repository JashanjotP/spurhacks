# File Upload Setup Guide

This guide explains how to set up the file upload system for the AI voice agent onboarding.

## Overview

The system allows users to upload documents during onboarding, which are then:
1. Stored in Supabase Storage
2. Document records created in the `documents` table
3. Basic text search functionality available

## Database Setup

### 1. Run the Documents Schema
Execute the documents schema to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/documents.sql
```

### 2. Set Up Storage Bucket
Create the storage bucket for files:

```sql
-- Run this in your Supabase SQL editor
\i frontend/src/scripts/storage-setup.sql
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase configuration (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Upload Flow

1. **User uploads files** during onboarding
2. **Files are stored** in Supabase Storage under `files/{businessId}/{filename}`
3. **Document records** are created in the `documents` table
4. **Text content** is extracted from files
5. **Basic search** becomes available for the business

## File Types Supported

- **PDF** (.pdf)
- **Word Documents** (.doc, .docx)
- **Text Files** (.txt)

## Storage Structure

```
Supabase Storage:
files/
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
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

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
  "business hours",
  businessId,
  5
);
```

### Get Document Stats
```typescript
const stats = await documentService.getDocumentStats(businessId);
console.log(`Total documents: ${stats.totalDocuments}`);
console.log(`Total size: ${stats.totalSize} bytes`);
```

## Search Details

The system provides basic text search functionality:
- Searches through document filenames and content
- Uses PostgreSQL ILIKE for case-insensitive matching
- Returns documents ordered by upload date
- Configurable result limit

## File Content Extraction

- **Text files**: Read as plain text
- **Other formats**: Currently read as base64 (future enhancement for PDF/DOC text extraction)

## Storage Policies

The storage bucket is configured with the following policies:
- Authenticated users can upload files
- Authenticated users can read their own files
- Authenticated users can delete their own files
- Files are organized by business ID for easy management

## Row Level Security (RLS)

The system includes proper RLS policies:
- Users can only access their own documents
- All database operations include user_id filtering
- Storage operations are properly authenticated

## Troubleshooting

### Common Issues:

1. **Storage bucket not found**
   - Run the storage setup script
   - Check bucket permissions
   - Verify bucket name is 'files'

2. **Upload failures**
   - Verify file size limits (10MB)
   - Check supported file types
   - Ensure user is authenticated
   - Check RLS policies are in place

3. **Database errors**
   - Run the documents schema script
   - Check RLS policies
   - Verify table permissions
   - Ensure user_id is included in inserts

4. **RLS Policy Errors**
   - Verify user authentication
   - Check that user_id is being passed correctly
   - Ensure RLS policies are properly configured

## Next Steps

1. Implement better text extraction for PDFs and Word documents
2. Add file preview functionality
3. Implement document versioning
4. Add bulk upload capabilities 