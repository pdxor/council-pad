# NFC Service for The Spatial Network World Builder

Local Node.js service that bridges ACR122U NFC reader to Supabase Realtime for table top presentations.

## Installation

```bash
npm install
```

### System Requirements

**macOS:**
- PC/SC framework (built-in, no setup needed)

**Linux:**
```bash
sudo apt-get install libpcsclite1 libpcsclite-dev pcscd
sudo systemctl start pcscd
sudo systemctl enable pcscd
```

**Windows:**
- Install ACR122U drivers from manufacturer website

## Configuration

Create `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
WORLD_ID=uuid-of-current-world
READER_ID=presentation-room-1
DEBUG=true
MAX_TAPS_PER_MINUTE=60
```

## Usage

```bash
# Development (with logging)
npm run dev

# Production (background service)
npm start

# Using PM2 (recommended for presentations)
pm2 start index.js --name nfc-service
pm2 logs nfc-service
pm2 stop nfc-service
```

## Testing

1. Connect ACR122U reader via USB
2. Run `npm run dev`
3. Tap an NFC tag
4. Should see log: "🏷️ NFC Tag Detected! UID: ..."

## Troubleshooting

**Reader not detected:**
- Check USB connection
- Verify pcscd running: `systemctl status pcscd`
- Try different USB port

**Tags not broadcasting:**
- Check Supabase credentials in `.env`
- Verify network connectivity
- Check firewall settings

