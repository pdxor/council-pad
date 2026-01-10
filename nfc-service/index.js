require('dotenv').config();
const { NFC } = require('nfc-pcsc');
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// CONFIGURATION
// =====================================================

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  worldId: process.env.WORLD_ID,
  readerId: process.env.READER_ID || 'default-reader',
  debug: process.env.DEBUG === 'true',
  maxTapsPerMinute: parseInt(process.env.MAX_TAPS_PER_MINUTE) || 60
};

// Validate configuration
if (!config.supabaseUrl || !config.supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

if (!config.worldId) {
  console.warn('⚠️  No WORLD_ID set, will broadcast to global channel');
}

// =====================================================
// INITIALIZE SUPABASE CLIENT
// =====================================================

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// =====================================================
// RATE LIMITING
// =====================================================

const tapHistory = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

function checkRateLimit() {
  const now = Date.now();
  const recentTaps = tapHistory.filter(t => now - t < RATE_LIMIT_WINDOW);
  tapHistory.length = 0;
  tapHistory.push(...recentTaps);
  
  if (recentTaps.length >= config.maxTapsPerMinute) {
    console.warn(`⚠️  Rate limit exceeded: ${recentTaps.length} taps in last minute`);
    return false;
  }
  
  return true;
}

// =====================================================
// NFC TAG UID FORMATTER
// =====================================================

function formatUID(uid) {
  if (!uid) {
    console.error('❌ UID is undefined or null');
    return 'UNKNOWN';
  }
  
  // Handle if uid is already a string
  if (typeof uid === 'string') {
    return uid.toUpperCase();
  }
  
  // Handle if uid is a buffer or array
  try {
    return Array.from(uid)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  } catch (e) {
    console.error('❌ Error formatting UID:', e.message);
    console.log('   UID value:', uid);
    console.log('   UID type:', typeof uid);
    return 'ERROR';
  }
}

// =====================================================
// BROADCAST NFC TAP TO SUPABASE REALTIME
// =====================================================

// Keep persistent channel for better reliability
let persistentChannel = null;

async function broadcastNFCTap(nfcUid) {
  const payload = {
    nfc_uid: nfcUid,
    world_id: config.worldId,
    timestamp: Date.now(),
    reader_id: config.readerId
  };

  try {
    const channelName = config.worldId 
      ? `nfc_triggers:${config.worldId}` 
      : 'nfc_triggers:global';

    if (config.debug) {
      console.log(`📡 Broadcasting to channel: ${channelName}`);
      console.log(`📡 Payload:`, JSON.stringify(payload, null, 2));
    }

    // Create persistent channel if it doesn't exist
    if (!persistentChannel) {
      console.log(`🔗 Creating persistent channel: ${channelName}`);
      persistentChannel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true }
        }
      });
      
      // Wait for subscription to complete
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Channel subscription timeout')), 5000);
        
        persistentChannel.subscribe((status) => {
          console.log(`📡 Channel subscription status: ${status}`);
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            clearTimeout(timeout);
            reject(new Error('Channel subscription failed'));
          }
        });
      });
    }
    
    // Send broadcast message
    const result = await persistentChannel.send({
      type: 'broadcast',
      event: 'nfc_tap',
      payload: payload
    });

    if (result === 'ok') {
      console.log(`✅ NFC tap broadcasted successfully: ${nfcUid}`);
      return true;
    } else {
      console.error(`❌ Broadcast failed with status: ${result}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error broadcasting NFC tap:', error.message);
    console.error('   This often means:');
    console.error('   1. Realtime Broadcast is not enabled in Supabase');
    console.error('   2. Network connectivity issues');
    console.error('   3. Invalid Supabase credentials');
    
    // Reset channel to retry on next tap
    if (persistentChannel) {
      await persistentChannel.unsubscribe();
      persistentChannel = null;
    }
    
    return false;
  }
}

// =====================================================
// MAIN NFC SERVICE
// =====================================================

function startNFCService() {
  console.log('\n🚀 Starting NFC Service for The Spatial Network');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 World ID: ${config.worldId || 'Global'}`);
  console.log(`🔧 Reader ID: ${config.readerId}`);
  console.log(`🐛 Debug Mode: ${config.debug}`);
  console.log(`⏱️  Rate Limit: ${config.maxTapsPerMinute} taps/minute`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const nfc = new NFC();

  // Reader detected
  nfc.on('reader', reader => {
    console.log(`✅ NFC Reader detected: ${reader.reader.name}`);
    console.log(`👂 Listening for NFC tags...\n`);

    // Card detected
    reader.on('card', async card => {
      console.log('\n🔍 Raw card object received:', card);
      console.log('🔍 Card keys:', Object.keys(card));
      console.log('🔍 Card UID:', card.uid);
      console.log('🔍 Card UID type:', typeof card.uid);
      
      const hardwareUID = formatUID(card.uid);
      console.log(`\n🏷️  NFC Tag Detected!`);
      console.log(`   Hardware UID: ${hardwareUID}`);
      console.log(`   Type: ${card.type || 'Unknown'}`);
      console.log(`   ATR: ${card.atr ? card.atr.toString('hex') : 'N/A'}`);

      // Try to read NDEF data from the tag
      let nfcData = hardwareUID; // Default to hardware UID if no data
      
      try {
        console.log('\n📖 Attempting to read NDEF data from tag...');
        
        // Read all available data blocks
        const data = await reader.read(0, 64); // Read 64 bytes starting from block 0
        
        if (data && data.length > 0) {
          console.log('📊 Raw data buffer:', data.toString('hex'));
          
          // Try to parse as text (look for ASCII text in the data)
          const textData = data.toString('utf8').replace(/\x00/g, '').trim();
          
          // First, try to parse as JSON (full model data embedded)
          if (textData.startsWith('{') && textData.includes('"id"')) {
            try {
              const jsonData = JSON.parse(textData);
              if (jsonData.id && jsonData.type === 'model_zoom') {
                nfcData = textData; // Use the full JSON string
                console.log(`✅ Full JSON data found in tag!`);
                console.log(`   Model: ${jsonData.name || jsonData.id}`);
              }
            } catch (e) {
              console.log(`⚠️  Text looks like JSON but couldn't parse: ${e.message}`);
            }
          }
          
          // If not JSON, check if it contains a model ID pattern (timestamp_randomstring)
          if (nfcData === hardwareUID) {
            const modelIdPattern = /\d{13,}_[a-z0-9]+/;
            const match = textData.match(modelIdPattern);
            
            if (match) {
              nfcData = match[0];
              console.log(`✅ Model ID found in NDEF data: ${nfcData}`);
            } else if (textData.length > 5 && textData.includes('_')) {
              // Fallback: if there's any text with underscore, use it
              nfcData = textData;
              console.log(`📝 Text data extracted: ${nfcData}`);
            } else {
              console.log(`⚠️  No valid data found`);
              console.log(`   Raw text: "${textData}"`);
            }
          }
        } else {
          console.log(`⚠️  No NDEF data found, using hardware UID`);
        }
      } catch (readError) {
        console.log(`⚠️  Could not read NDEF data: ${readError.message}`);
        console.log(`   Using hardware UID instead: ${hardwareUID}`);
      }

      console.log(`\n🎯 NFC Identifier to use: ${nfcData}`);

      // Rate limiting
      if (!checkRateLimit()) {
        console.log(`⚠️  Tag ignored due to rate limit\n`);
        return;
      }

      tapHistory.push(Date.now());

      // Broadcast to Supabase using the data (model ID or hardware UID)
      const success = await broadcastNFCTap(nfcData);
      
      if (success) {
        console.log(`✨ Model interaction triggered in World Builder`);
      } else {
        console.log(`❌ Failed to trigger model interaction`);
      }
      console.log(''); // Blank line for readability
    });

    // Card removed
    reader.on('card.off', card => {
      const uid = formatUID(card.uid);
      if (config.debug) {
        console.log(`👋 NFC Tag removed: ${uid}\n`);
      }
    });

    // Reader errors
    reader.on('error', err => {
      console.error(`❌ Reader error: ${err.message}`);
    });
  });

  // No readers found
  nfc.on('error', err => {
    console.error(`❌ NFC Service error: ${err.message}\n`);
    console.log('💡 Troubleshooting:');
    console.log('   1. Ensure ACR122U reader is connected via USB');
    console.log('   2. Check that PC/SC daemon is running:');
    console.log('      macOS: Built-in, should work automatically');
    console.log('      Linux: sudo systemctl status pcscd');
    console.log('      Windows: Check Device Manager for smartcard readers');
    console.log('   3. Verify user has permissions for USB devices');
    console.log('   4. Try a different USB port');
    console.log('   5. Restart the service\n');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down NFC Service...');
    console.log('   Goodbye! 🌍✨\n');
    process.exit(0);
  });

  // Heartbeat (optional - for monitoring)
  if (config.debug) {
    setInterval(() => {
      const now = new Date().toLocaleTimeString();
      console.log(`💓 Heartbeat [${now}] - Service running, ${tapHistory.length} recent taps`);
    }, 60000); // Every minute
  }
}

// =====================================================
// START THE SERVICE
// =====================================================

console.log('\n📦 NFC Service v1.0.0');
console.log('   The Spatial Network - World Builder Integration\n');

startNFCService();

