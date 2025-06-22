# Supabase Integration Setup

This guide will help you set up Supabase for the AI Voice Agent onboarding system.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. The project dependencies installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "ai-voice-agents")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Set Up Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon public key

3. Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Migrations

1. In your Supabase dashboard, go to the SQL Editor
2. Run the following SQL scripts in order:

### First, run the documents schema:
```sql
-- Copy and paste the contents of frontend/src/scripts/documents.sql
```

### Then, run the onboarding schema:
```sql
-- Copy and paste the contents of frontend/src/scripts/onboarding.sql
```

## Step 4: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set authorized redirect URI to: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
   - Back in Supabase, paste these values and enable Google provider

## Step 5: Configure Row Level Security (RLS)

The SQL scripts already include RLS policies, but verify they're working:

1. Go to Authentication > Policies in your Supabase dashboard
2. Ensure the following tables have RLS enabled:
   - `businesses`
   - `onboarding_sessions`
   - `documents`
   - `document_chunks`

## Step 6: Test the Integration

1. Start your development server:
```bash
cd frontend
npm run dev
```

2. Navigate to `http://localhost:3000/dashboard/onboarding`
3. You should be prompted to sign in with Google
4. Complete the onboarding process
5. Check your Supabase dashboard > Table Editor to see the data

## Database Schema Overview

### Tables Created:

1. **businesses** - Stores business information from onboarding
   - `id` (text, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `name` (text)
   - `business_type` (text)
   - `agent_type` (text, enum: 'faq', 'booking', 'order')
   - `business_hours` (jsonb)
   - `greeting` (text)
   - `phone_number` (text)
   - `website_url` (text, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **onboarding_sessions** - Tracks onboarding progress
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `business_id` (text, foreign key to businesses, nullable)
   - `current_step` (integer)
   - `completed` (boolean)
   - `onboarding_data` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)
   - `completed_at` (timestamp, nullable)

3. **documents** - Stores uploaded knowledge base files
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `business_id` (text)
   - `filename` (text)
   - `file_type` (text)
   - `file_size` (bigint)
   - `content` (text)
   - `uploaded_at` (timestamp)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

4. **document_chunks** - Stores document chunks with embeddings
   - `id` (uuid, primary key)
   - `document_id` (uuid, foreign key to documents)
   - `user_id` (uuid, foreign key to auth.users)
   - `business_id` (text)
   - `chunk_index` (integer)
   - `content` (text)
   - `embedding` (vector(1536), nullable)
   - `metadata` (jsonb)
   - `created_at` (timestamp)

## Features

### Authentication
- Google OAuth integration
- Automatic session management
- Protected routes

### Onboarding System
- Multi-step wizard with progress tracking
- Session persistence
- Business creation with phone number generation
- Document upload support (ready for future implementation)

### Business Management
- View all user businesses
- Delete businesses
- Export data functionality
- Statistics dashboard

### Document Management
- Upload documents with chunking
- Vector search capabilities (requires embeddings)
- Business-specific document organization

## Troubleshooting

### Common Issues:

1. **Authentication not working**
   - Check your Google OAuth configuration
   - Verify redirect URIs are correct
   - Ensure environment variables are set

2. **Database errors**
   - Check that all SQL scripts ran successfully
   - Verify RLS policies are in place
   - Check table permissions

3. **Vector search not working**
   - Ensure pgvector extension is enabled
   - Check that embeddings are being generated
   - Verify the search function exists

### Getting Help

- Check Supabase logs in the dashboard
- Review browser console for errors
- Verify environment variables are loaded correctly

## Next Steps

1. Implement document upload functionality
2. Add embedding generation for document chunks
3. Implement vector search for knowledge base queries
4. Add phone number provisioning integration
5. Implement agent deployment functionality 