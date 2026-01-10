#!/bin/bash

# CouncilPAD v1.1 - Supabase Migration Script
# Run this to set up your database

echo "🏛 CouncilPAD v1.1 - Database Setup"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "Install with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Get Supabase credentials from environment or prompt
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Enter your Supabase Project ID:"
    read SUPABASE_PROJECT_ID
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "Enter your Supabase Database Password:"
    read -s SUPABASE_DB_PASSWORD
fi

echo "📦 Project ID: $SUPABASE_PROJECT_ID"
echo ""

# Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $SUPABASE_PROJECT_ID --password $SUPABASE_DB_PASSWORD

if [ $? -eq 0 ]; then
    echo "✅ Linked successfully"
else
    echo "❌ Link failed"
    exit 1
fi

echo ""

# Apply migrations
echo "🚀 Applying migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migrations applied successfully"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to start the development server"
    echo "  2. Open http://localhost:3000"
    echo "  3. Add statues using the NFC scanner (dev mode)"
    echo ""
else
    echo "❌ Migration failed"
    echo ""
    echo "Try manual setup:"
    echo "  1. Go to https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql"
    echo "  2. Run supabase/migrations/20250103000001_initial_schema.sql"
    echo "  3. Run supabase/migrations/20250103000002_seed_data.sql"
    exit 1
fi

