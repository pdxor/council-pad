🔧 **IMPORTANT: Update Your Environment Variables**

## Problem
Your web app and NFC service are pointing to DIFFERENT databases!
- Web app: Your current project (NEW)
- NFC service: Old project (OLD)

They need to use the SAME database so scanned NFC tags appear in the web app.

---

## ✅ **Fix #1: Update NFC Service Database**

Edit: `/Users/kahlilcalavas/Desktop/council-of-elders/nfc-service/.env`

Change from:
```env
SUPABASE_URL=https://aws-0-us-west-1.pooler.supabase.com:5432/postgres
# (or whatever old URL is there)
```

To:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
```

---

## ✅ **Fix #2: Verify Web App Database**

Edit: `/Users/kahlilcalavas/Desktop/council-of-elders/.env.local`

Should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Add your OpenAI key here when ready:
OPENAI_API_KEY=sk-your-key-here
```

---

## ✅ **Fix #3: Create Database Tables**

Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

Copy the ENTIRE contents of:
```
/Users/kahlilcalavas/Desktop/council-of-elders/supabase/migrations/20250103000001_initial_schema.sql
```

Paste into SQL Editor and click **RUN**.

This creates the `nfc_payloads` table that stores your scanned tags.

---

## ✅ **Fix #4: Restart Services**

After making these changes:

```bash
# Kill old NFC service
pkill -f councilpad-service

# Restart NFC service (in terminal 2)
cd /Users/kahlilcalavas/Desktop/council-of-elders/nfc-service
node councilpad-service.js

# Restart web app (in terminal 1)
cd /Users/kahlilcalavas/Desktop/council-of-elders
npm run dev
```

---

## 🎯 **Then Test:**

1. **Tap your Buckminster Fuller NFC tag**
2. **Check NFC service output** - should say "✅ Council member stored in database!"
3. **Refresh web app** at http://localhost:3000
4. **Look for** "Scanned tags (from NFC reader):" dropdown
5. **Select** Buckminster Fuller from dropdown
6. **Watch** his seat light up! 🏛✨

---

## 📋 **What This Does:**

Both services now write/read from the SAME database:
```
NFC Reader → Scans tag → NFC Service → Writes to Supabase
                                              ↓
Web App → Reads from Supabase → Shows in dropdown
```

**Physical and digital are now connected!** 🎉

