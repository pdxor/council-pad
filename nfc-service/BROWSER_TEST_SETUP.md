# Setup NFC Service for Browser Testing

## ✅ What We Just Did

Integrated the NFC listener into the Public World Viewer! Now when you load a world, it will automatically listen for NFC taps.

## 🚀 Next Steps to Test

### Step 1: Get Your Supabase Service Role Key

1. Go to: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api`
2. Copy the `service_role` key (the secret one, not the anon key)

### Step 2: Get Your World ID

1. Open your public world viewer: `https://your-app.com/world/[WORLD-ID]`
2. Copy the `[WORLD-ID]` from the URL
   - Example: If URL is `/world/abc123-def456`, then `abc123-def456` is your World ID

### Step 3: Create `.env` File

In the `nfc-service/` folder, create a file named `.env` (no extension) with:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
WORLD_ID=your-world-id-here
DEBUG=true
```

### Step 4: Start the NFC Service

```bash
cd nfc-service
node index.js
```

You should see:
```
🚀 Starting NFC Service for The Spatial Network
✅ NFC Reader detected: ACR122U...
👂 Listening for NFC tags...
```

### Step 5: Open Public World Viewer

1. Open your world in the browser
2. Open DevTools Console (Cmd+Opt+J / F12)
3. Look for:

```
╔═══════════════════════════════════════════════════════╗
║  🎧 NFC LISTENER STARTING...                          ║
╚═══════════════════════════════════════════════════════╝
📡 Channel: nfc_triggers:your-world-id
✅ Successfully connected to NFC service!
   Tap an NFC tag on your reader to test...
```

### Step 6: Tap Your NFC Tag!

When you tap, you'll see:

**In Terminal (NFC Service):**
```
🏷️  NFC Tag Detected!
   UID: 04:A1:23:B2:45:67:80
✅ NFC tap broadcasted
```

**In Browser Console:**
```
╔═══════════════════════════════════════════════════════╗
║  🏷️  NFC TAP RECEIVED IN BROWSER!                    ║
╚═══════════════════════════════════════════════════════╝
📋 Event Details:
   UID:       04:A1:23:B2:45:67:80
   World ID:  your-world-id
```

## 🎯 Expected Behavior

- **If tag is mapped:** Camera will zoom to the model and info panel will open
- **If tag is NOT mapped:** You'll see an error message saying the tag needs to be mapped first

## 📝 Mapping NFC Tags

Before NFC taps can trigger models, you need to map them:

1. Use the NFC Mapping Panel in World Builder
2. Select a 3D model in the world
3. Paste the NFC UID you got from `test-reader.js`
4. Click "Map NFC Tag"

Now when you tap that tag, it will zoom to that specific model!

## 🔍 Troubleshooting

### "Channel not connected"
- Check your WORLD_ID matches the URL
- Verify SUPABASE_URL and SERVICE_KEY are correct

### "No events in browser"
- Make sure both the NFC service and browser are using the SAME world ID
- Check the channel names match in both console logs

### "Tag not mapped" error
- This is normal! You need to map the NFC UID to a model first
- Copy the UID from the console and use the NFC Mapping Panel

