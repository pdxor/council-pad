🏛 **CouncilPAD Database Setup Instructions**

## The Problem
The web app is trying to fetch NFC tags from the `nfc_payloads` table, but the table doesn't exist yet in your Supabase database.

## The Solution
Run the migration SQL in Supabase's SQL Editor (takes 2 minutes):

---

## ✅ **Step-by-Step Instructions:**

### 1. Open Supabase SQL Editor
Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`

(Replace `YOUR_PROJECT_ID` with your actual Supabase project ID)

### 2. Copy the Migration SQL
Open this file in your editor:
```
./supabase/migrations/20250103000001_initial_schema.sql
```

Copy ALL the contents (it's 210 lines).

### 3. Paste and Run
- Paste the SQL into the Supabase SQL Editor
- Click the **"Run"** button (bottom right)
- Wait for it to complete (~5-10 seconds)

### 4. Verify Success
You should see a success message. The following tables will be created:
- ✅ `prompt_fragments` — Reusable prompt building blocks
- ✅ `nfc_payloads` — Scanned NFC tags (this is the one we need!)
- ✅ `sessions` — Council session tracking
- ✅ `questions` — Question library
- ✅ `responses` — Council responses

### 5. Optional: Seed Data
If you want sample questions and prompt fragments, also run:
```
./supabase/migrations/20250103000002_seed_data.sql
```

---

## ✨ **After Running the Migration:**

1. **Refresh your web app** at http://localhost:3000
2. **The console error will disappear**
3. **Tap your Buckminster Fuller NFC tag**
4. **Refresh the page** — You'll see him in the dropdown with a 🏷️ icon!

---

## 🔍 **Alternative: Use Supabase CLI (if you have it)**

If you have Supabase CLI installed:
```bash
supabase db push --project-ref YOUR_PROJECT_ID
```

(Replace `YOUR_PROJECT_ID` with your actual Supabase project ID)

---

## 📋 **What This Does:**

The migration creates a database schema where:
- Your **physical NFC reader** scans tags and stores them in `nfc_payloads`
- The **web app** fetches from `nfc_payloads` and shows them in the dropdown
- When you select a scanned member, their worldview becomes part of the council!

**This bridges the physical → digital gap!** 🏛✨

