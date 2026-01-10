# 🏛 CouncilPAD NFC Reader Setup Guide

## ✅ Quick Start (3 Steps)

### **1. Configure NFC Service**

Navigate to the NFC service folder and create `.env` file:

```bash
cd /Users/kahlilcalavas/Desktop/council-of-elders/nfc-service
```

Create `.env` file with this content:

```env
SUPABASE_URL=https://jrykxtuetruvouhulbh.supabase.co
SUPABASE_SERVICE_KEY=<YOUR_SERVICE_KEY_HERE>
WORLD_ID=councilpad-v1
READER_ID=council-table-1
DEBUG=true
MAX_TAPS_PER_MINUTE=60
```

**⚠️ Get your `SUPABASE_SERVICE_KEY`:**
1. Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`
2. Find "Service Role" key (NOT the anon key)
3. Copy and paste it into `.env` file

---

### **2. Add OpenAI API Key**

In the main CouncilPAD directory, update `.env.local`:

```bash
cd /Users/kahlilcalavas/Desktop/council-of-elders
```

Add your OpenAI key to `.env.local`:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# OpenAI - ADD YOUR KEY HERE
OPENAI_API_KEY=sk-your-openai-api-key-here

# Set to production when ready for real AI
NODE_ENV=development
```

**🔑 Get OpenAI API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env.local`

---

### **3. Run NFC Service**

With your reader plugged in and Buckminster Fuller tag ready:

```bash
cd /Users/kahlilcalavas/Desktop/council-of-elders/nfc-service
npm run dev
```

You should see:
```
🏛  CouncilPAD NFC Service v1.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Where wisdom becomes present
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ NFC Reader connected: ACS ACR122U
👂 Ready to read council member tags...
```

**Now tap your Buckminster Fuller tag!**

---

## 📱 What Happens When You Tap

```
🏷️  NFC Tag Detected!
   Hardware UID: A1:B2:C3:D4

📖 Reading council member data...

📦 Parsed Payload:
   ID: buckminster_fuller
   Role: systems_designer
   Axioms: whole_systems, ephemeralization, design_science
   Priority: 1.3

✅ Council member stored in database!
   Ready to use in CouncilPAD app

✨ Council member activated!
   Add this member in the CouncilPAD app
```

---

## 🌐 Use in Web App

Once the tag is read by the NFC service:

1. **It's automatically stored in Supabase**
2. **Open the CouncilPAD web app**: http://localhost:3000
3. **Open the dropdown** in "Add Council Member"
4. **You'll see "Buckminster Fuller"** in the list!
5. **Click to add him to the council**

---

## 🔧 Troubleshooting

### **Reader Not Detected**

```bash
# Check if reader is connected
lsusb | grep ACS
# Should show: "ACS ACR122U PICC Interface"
```

If not found:
- Try different USB port
- Restart reader (unplug/replug)
- Check that PC/SC daemon is running (automatic on macOS)

### **Can't Read Tag**

- Make sure tag is close to reader (within 1cm)
- Hold tag steady for 2-3 seconds
- Check that tag has data programmed on it

### **Database Errors**

- Verify `SUPABASE_SERVICE_KEY` is correct
- Check network connection
- Make sure database migrations ran (`./setup-db.sh`)

### **OpenAI Not Working**

- Make sure `OPENAI_API_KEY` is set in `.env.local`
- Restart Next.js dev server after adding key
- Check you have GPT-4 API access

---

## 📝 NFC Service Commands

```bash
# Start in debug mode (recommended for testing)
npm run dev

# Start in production mode
npm start

# Run as background service (with PM2)
pm2 start councilpad-service.js --name councilpad-nfc
pm2 logs councilpad-nfc
pm2 stop councilpad-nfc
```

---

## ✅ Success Checklist

- [ ] NFC service `.env` file created with Supabase credentials
- [ ] OpenAI API key added to main `.env.local`
- [ ] NFC reader plugged in via USB
- [ ] NFC service running (`npm run dev`)
- [ ] Reader detected (see "✅ NFC Reader connected")
- [ ] Buckminster Fuller tag programmed with JSON payload
- [ ] Tag tapped and read successfully
- [ ] Council member shows in database
- [ ] Web app running at http://localhost:3000
- [ ] Can add Buckminster Fuller in the UI

---

## 🎯 What's Programmed on Your Tag

Your Buckminster Fuller tag should contain:

```json
{
  "id": "buckminster_fuller",
  "role": "systems_designer",
  "tone": ["optimistic", "precise", "global"],
  "axioms": ["whole_systems", "ephemeralization", "design_science"],
  "priority": 1.3
}
```

This gets read by the NFC service and stored in your database, making it available in the web app!

---

## 🚀 Next Steps

Once Buckminster Fuller works:

1. **Program more tags** with other thinkers
2. **Test combinations** (e.g., Fuller + Jung + Naess)
3. **Try different presets** (Regenerative, Systems, Radical Truth)
4. **Ask real questions** to the council
5. **Add your OpenAI key** to get real GPT-4 responses

---

**Ready to scan! 🏛✨**

