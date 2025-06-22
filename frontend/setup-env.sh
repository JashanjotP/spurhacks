#!/bin/bash

echo "🚀 Setting up Supabase Environment Variables"
echo "============================================="

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

echo ""
echo "📋 Please provide your Supabase project details:"
echo ""

# Get Supabase URL
echo "Enter your Supabase Project URL (e.g., https://your-project.supabase.co):"
read -r supabase_url

# Get Supabase Anon Key
echo "Enter your Supabase Anon Key:"
read -r supabase_anon_key

# Validate inputs
if [ -z "$supabase_url" ] || [ -z "$supabase_anon_key" ]; then
    echo "❌ Error: Both URL and Anon Key are required!"
    exit 1
fi

# Create .env.local file
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key

# Development Settings
NEXT_PUBLIC_APP_ENV=development
EOF

echo ""
echo "✅ Environment variables created successfully!"
echo ""
echo "📁 File created: .env.local"
echo "🔐 Supabase URL: $supabase_url"
echo "🔑 Anon Key: ${supabase_anon_key:0:20}..."
echo ""
echo "🚀 Next steps:"
echo "1. Run the SQL migrations in your Supabase dashboard"
echo "2. Start your development server: npm run dev"
echo "3. Test the integration at: http://localhost:3000/dashboard/test-supabase"
echo ""
echo "📖 For detailed setup instructions, see: SUPABASE_SETUP.md" 