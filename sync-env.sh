#!/bin/bash

# CouncilPAD Environment Setup Helper
# Syncs both .env files to use the same Supabase database

echo "🏛  CouncilPAD Environment Sync"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prompt for Supabase credentials
echo "Enter your Supabase URL:"
read NEW_URL

echo "Enter your Supabase Anon Key:"
read -s NEW_KEY
echo ""

# Update NFC service .env
echo "📝 Updating NFC service environment..."
cat > nfc-service/.env << EOF
# CouncilPAD NFC Service Configuration
# Synced with web app database

SUPABASE_URL=${NEW_URL}
SUPABASE_KEY=${NEW_KEY}

RATE_LIMIT_MS=2000
EOF

echo "✅ NFC service .env updated"
echo ""

# Update web app .env.local
echo "📝 Updating web app environment..."
cat > .env.local << EOF
# CouncilPAD Web App Configuration

NEXT_PUBLIC_SUPABASE_URL=${NEW_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEW_KEY}

# Add your OpenAI key here:
# OPENAI_API_KEY=sk-your-key-here

NODE_ENV=development
EOF

echo "✅ Web app .env.local updated"
echo ""

echo "🎉 Both services now point to: ${NEW_URL}"
echo ""
echo "📋 Next steps:"
echo "   1. Run database migration (see DATABASE_SETUP.md)"
echo "   2. Restart both services"
echo "   3. Tap an NFC tag to test!"
echo ""

