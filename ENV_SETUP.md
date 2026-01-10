# Environment Configuration Setup

This file explains how to set up your environment variables for the CouncilPAD project.

## Quick Setup

1. **Copy the template file:**
   ```bash
   cp ENV_TEMPLATE.txt .env.local
   ```

2. **Fill in your credentials in `.env.local`:**
   - Get Supabase credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
   - Get OpenAI API key from: https://platform.openai.com/api-keys

## Required Environment Variables

### Main Application (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# OpenAI Configuration (optional for development, uses mock responses)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Development Mode
NODE_ENV=development
```

### NFC Service (nfc-service/.env)

```bash
# Supabase Configuration (same as main app)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here

# NFC Reader Settings
RATE_LIMIT_MS=2000
```

## Helper Scripts

### sync-env.sh
Automatically creates both `.env.local` and `nfc-service/.env` with the same credentials:
```bash
./sync-env.sh
```

### setup-db.sh
Sets up the database schema using Supabase CLI:
```bash
./setup-db.sh
```

## Security Notes

⚠️ **NEVER commit `.env` or `.env.local` files to git!**

- All `.env*` files are already in `.gitignore`
- Use `ENV_TEMPLATE.txt` as a reference for required variables
- Store production secrets in your deployment platform (Vercel, etc.)

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the project root
- Verify the environment variable names match exactly
- Restart your dev server after creating/modifying `.env.local`

### NFC service can't connect to database
- Check that `nfc-service/.env` has valid Supabase credentials
- Make sure you're using the same database URL in both files
- Verify your Supabase project is active

### OpenAI not responding
- The app will use mock responses if `OPENAI_API_KEY` is not set
- For production, add a valid OpenAI API key to `.env.local`
- Restart the server after adding the key

