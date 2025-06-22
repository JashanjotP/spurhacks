# Supabase Setup Guide

This guide will help you set up Supabase for the AI voice agent onboarding system.

## Prerequisites

- A Supabase account
- Node.js and npm installed
- Basic knowledge of SQL

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `spurhacks-ai-agent` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your `frontend` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth (for authentication)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 4: Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following scripts in order:

### 4.1 Onboarding Schema
```sql
-- Copy and paste the contents of frontend/src/scripts/onboarding.sql
```

### 4.2 Documents Schema
```sql
-- Copy and paste the contents of frontend/src/scripts/documents.sql
```

### 4.3 Storage Setup
```sql
-- Copy and paste the contents of frontend/src/scripts/storage-setup.sql
```

## Step 5: Set Up Authentication

### 5.1 Enable Google OAuth

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Google** and click **Enable**
3. You'll need to create a Google OAuth application:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Set application type to **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Copy the **Client ID** and **Client Secret** to Supabase
5. Save the configuration

### 5.2 Configure Site URL

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Set **Site URL** to `http://localhost:3000` (for development)
3. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

## Step 6: Test the Setup

1. Start your development server:
```bash
cd frontend
npm run dev
```

2. Visit `http://localhost:3000`
3. Try to sign up/sign in with Google
4. Test the onboarding flow
5. Test file upload functionality

## Database Schema Overview

The system uses these main tables:

1. **onboarding_sessions** - Stores onboarding progress
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `current_step` (integer)
   - `data` (jsonb)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **businesses** - Stores business information
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `name` (text)
   - `type` (text)
   - `phone_number` (text)
   - `created_at` (timestamp)

3. **documents** - Stores uploaded documents
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

## Features

### Authentication
- Google OAuth integration
- Automatic session management
- Protected routes

### Onboarding System
- Multi-step wizard with progress tracking
- Session persistence
- Business creation with phone number generation
- Document upload support

### Business Management
- View all user businesses
- Delete businesses
- Export data functionality
- Statistics dashboard

### Document Management
- Upload documents to Supabase Storage
- Basic text search functionality
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

3. **File upload not working**
   - Ensure storage bucket is created
   - Check storage policies
   - Verify file size limits

### Getting Help

- Check Supabase logs in the dashboard
- Review browser console for errors
- Verify environment variables are loaded correctly

## Next Steps

1. Implement better text extraction for PDFs and Word documents
2. Add file preview functionality
3. Implement document versioning
4. Add phone number provisioning integration
5. Implement agent deployment functionality 