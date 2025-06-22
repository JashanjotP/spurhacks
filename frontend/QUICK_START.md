# 🚀 Quick Start Guide - Supabase Integration

This guide will help you quickly set up and test the Supabase integration for the AI Voice Agent onboarding system.

## Prerequisites

- Node.js and npm installed
- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Git (optional, for version control)

## Step 1: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com) and sign in
   - Click "New Project"
   - Choose your organization
   - Enter project name: `ai-voice-agents`
   - Set a secure database password
   - Choose a region close to you
   - Click "Create new project"

2. **Get your project credentials:**
   - In your project dashboard, go to Settings > API
   - Copy the "Project URL" and "Anon public key"

## Step 2: Configure Environment Variables

### Option A: Use the setup script (Recommended)
```bash
cd frontend
./setup-env.sh
```

### Option B: Manual setup
Create a `.env.local` file in the `frontend` directory:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Development Settings
NEXT_PUBLIC_APP_ENV=development
```

## Step 3: Run Database Migrations

1. **In your Supabase dashboard, go to SQL Editor**

2. **Run the documents schema first:**
   ```sql
   -- Copy and paste the contents of frontend/src/scripts/documents.sql
   ```

3. **Then run the onboarding schema:**
   ```sql
   -- Copy and paste the contents of frontend/src/scripts/onboarding.sql
   ```

## Step 4: Install Dependencies and Start Development Server

```bash
cd frontend
npm install
npm run dev
```

## Step 5: Test the Integration

1. **Open your browser and go to:**
   ```
   http://localhost:3000/dashboard/test-supabase
   ```

2. **Verify the connection:**
   - You should see "Authentication: Connected" (using demo user)
   - No errors should appear
   - The test page should load successfully

3. **Test the onboarding flow:**
   - Go to: `http://localhost:3000/dashboard/onboarding`
   - Complete the onboarding steps
   - Check that data is being saved (watch the console for logs)

4. **Check the businesses page:**
   - Go to: `http://localhost:3000/dashboard/businesses`
   - You should see any businesses created during onboarding

## Step 6: Verify Data in Supabase

1. **In your Supabase dashboard, go to Table Editor**
2. **Check the following tables:**
   - `onboarding_sessions` - Should show your session data
   - `businesses` - Should show any businesses created
   - `documents` - Will be empty until you upload files
   - `document_chunks` - Will be empty until you upload files

## Troubleshooting

### Common Issues:

1. **"Failed to create onboarding session"**
   - Check your environment variables are correct
   - Verify the SQL migrations ran successfully
   - Check the browser console for detailed errors

2. **"Authentication: Not connected"**
   - This is expected when authentication is disabled
   - The system will use a demo user ID

3. **Database errors**
   - Ensure all SQL scripts ran successfully
   - Check that RLS policies are in place
   - Verify table permissions

### Getting Help:

- Check the browser console for error messages
- Review the Supabase logs in your dashboard
- See the detailed setup guide: `SUPABASE_SETUP.md`

## Next Steps

Once the basic integration is working:

1. **Enable authentication** by uncommenting the AuthCheck in `frontend/src/app/dashboard/layout.tsx`
2. **Configure Google OAuth** in your Supabase dashboard
3. **Test with real authentication**
4. **Implement document upload functionality**
5. **Add vector search capabilities**

## Development Notes

- The system currently uses a demo user ID (`demo-user-123`) when authentication is disabled
- All data is saved to Supabase in real-time as you progress through onboarding
- The test page provides comprehensive debugging information
- Check the browser console for detailed logs of all operations

## File Structure

```
frontend/
├── src/
│   ├── lib/supabase/
│   │   ├── client.ts              # Supabase client configuration
│   │   └── onboarding-service.ts  # Main service layer
│   ├── components/auth/
│   │   └── auth-check.tsx         # Authentication wrapper
│   ├── app/dashboard/
│   │   ├── onboarding/page.tsx    # Onboarding page
│   │   ├── businesses/page.tsx    # Businesses management
│   │   └── test-supabase/page.tsx # Test interface
│   └── scripts/
│       ├── documents.sql          # Document tables schema
│       └── onboarding.sql         # Onboarding tables schema
├── .env.local                     # Environment variables
├── setup-env.sh                   # Setup script
├── SUPABASE_SETUP.md              # Detailed setup guide
└── QUICK_START.md                 # This file
```

Happy coding! 🎉 