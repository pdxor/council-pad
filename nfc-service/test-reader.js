/**
 * NFC Reader Test Script
 * Just logs what the reader detects - no Supabase connection needed
 * Run with: node test-reader.js
 */

const { NFC } = require('nfc-pcsc');

console.log('\n🔍 NFC Reader Test Mode');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('This script will detect your NFC reader and log');
console.log('any NFC tags you tap to the console.\n');
console.log('Press Ctrl+C to exit.\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const nfc = new NFC();

nfc.on('reader', reader => {
  console.log(`✅ Reader Connected!`);
  console.log(`   Name: ${reader.reader.name}`);
  console.log(`   Status: Ready and listening...\n`);

  reader.on('card', card => {
    const uid = Array.from(card.uid)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();

    console.log(`\n╔═══════════════════════════════════════╗`);
    console.log(`║      🏷️  NFC TAG DETECTED!           ║`);
    console.log(`╚═══════════════════════════════════════╝`);
    console.log(`\n📋 Tag Details:`);
    console.log(`   UID:  ${uid}`);
    console.log(`   Type: ${card.type || 'Unknown'}`);
    console.log(`   Standard: ${card.standard || 'Unknown'}`);
    
    if (card.atr) {
      console.log(`   ATR:  ${card.atr.toString('hex')}`);
    }
    
    console.log(`\n✅ This UID can be used to map to a 3D model!`);
    console.log(`   Copy this: ${uid}\n`);
  });

  reader.on('card.off', card => {
    const uid = Array.from(card.uid)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
    console.log(`👋 Tag removed: ${uid}\n`);
  });

  reader.on('error', err => {
    console.error(`❌ Reader error: ${err.message}`);
  });
});

nfc.on('error', err => {
  console.error(`\n❌ NFC Error: ${err.message}\n`);
  console.log('💡 Troubleshooting Tips:');
  console.log('   1. Is your ACR122U reader plugged into USB?');
  console.log('   2. macOS: Should work automatically');
  console.log('   3. Linux: Run "sudo systemctl status pcscd"');
  console.log('   4. Windows: Check Device Manager');
  console.log('   5. Try a different USB port\n');
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Test ended. Goodbye!\n');
  process.exit(0);
});

