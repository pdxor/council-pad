# NFC Reader Test Guide

## Quick Test Setup

### Step 1: Test the Reader Hardware (No Supabase needed)

This will just confirm your ACR122U reader is working and reading tags.

```bash
cd nfc-service
npm install
node test-reader.js
```

**What you'll see:**
- ✅ Reader connected message
- When you tap an NFC tag, you'll see its UID printed in the console
- Copy that UID - you'll need it to map to a 3D model

### Step 2: Set Up the NFC Service (Broadcasts to Browser)

1. Create `.env` file in `nfc-service/`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
WORLD_ID=your-world-id-here
DEBUG=true
```

2. Start the service:

```bash
node index.js
```

**What you'll see:**
- 🚀 Service starting message
- ✅ Reader detected
- When you tap: Broadcasting message + UID

### Step 3: Test in Browser

1. Open your World Builder in the browser
2. Open the console (Cmd+Opt+J on Mac, F12 on Windows)
3. Look for these messages:

```
╔═══════════════════════════════════════════════════════╗
║  🎧 NFC LISTENER STARTING...                          ║
╚═══════════════════════════════════════════════════════╝
📡 Channel: nfc_triggers:your-world-id
✅ Successfully connected to NFC service!
```

4. Now tap your NFC tag on the reader

**What you should see in browser console:**

```
╔═══════════════════════════════════════════════════════╗
║  🏷️  NFC TAP RECEIVED IN BROWSER!                    ║
╚═══════════════════════════════════════════════════════╝
📋 Event Details:
   UID:       04:A1:23:B2:45:67:80
   World ID:  abc123...
   ...
```

## Troubleshooting

### "No reader detected"
- Check USB connection
- macOS: Should work automatically
- Linux: `sudo systemctl start pcscd`
- Windows: Check Device Manager for smart card readers

### "Browser not receiving events"
- Check that WORLD_ID in `.env` matches the world you have open
- Verify Supabase URL and SERVICE_KEY are correct
- Check browser console for connection status

### "NFC tag not mapped"
- You need to map the NFC UID to a 3D model first
- Use the NFC Mapping Panel in World Builder
- Paste the UID you got from test-reader.js

## Channel Naming

The service broadcasts to: `nfc_triggers:${WORLD_ID}`
The browser listens on: `nfc_triggers:${worldId}`

Make sure these match!

