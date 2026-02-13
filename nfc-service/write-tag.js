/**
 * NFC Tag Writer for CouncilPAD
 * 
 * Writes council member JSON data to NFC tags (NTAG213/215/216)
 * Usage: node write-tag.js ../carl_jung.json
 */

const { NFC } = require('nfc-pcsc');
const fs = require('fs');
const path = require('path');

// =====================================================
// CONFIGURATION
// =====================================================

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Usage: node write-tag.js <json-file>');
  console.error('   Example: node write-tag.js ../carl_jung.json');
  process.exit(1);
}

const jsonFilePath = path.resolve(args[0]);

// =====================================================
// LOAD JSON DATA
// =====================================================

let jsonData;
try {
  const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
  jsonData = JSON.parse(fileContent);
  
  // Validate required fields
  if (!jsonData.id || !jsonData.role) {
    console.error('❌ Invalid JSON: missing required fields "id" and "role"');
    process.exit(1);
  }
  
  console.log('✅ JSON loaded successfully:');
  console.log(`   ID: ${jsonData.id}`);
  console.log(`   Role: ${jsonData.role}`);
  console.log(`   Axioms: ${jsonData.axioms?.join(', ') || 'none'}`);
  console.log(`   Tone: ${jsonData.tone?.join(', ') || 'none'}`);
  console.log(`   Priority: ${jsonData.priority || 1.0}`);
  console.log('');
  
} catch (error) {
  console.error('❌ Error loading JSON file:', error.message);
  process.exit(1);
}

// =====================================================
// CONVERT JSON TO BYTES
// =====================================================

function jsonToNFCBytes(jsonObj) {
  // Convert JSON to compact string (no extra whitespace)
  const jsonString = JSON.stringify(jsonObj);
  
  console.log(`📝 JSON to write: ${jsonString}`);
  console.log(`📏 Length: ${jsonString.length} characters`);
  console.log('');
  
  // NDEF Text Record Format
  // See: https://learn.adafruit.com/adafruit-pn532-rfid-nfc/ndef
  
  const textBytes = Buffer.from(jsonString, 'utf8');
  const textLength = textBytes.length;
  
  // NDEF Message structure:
  // 0x03 = NDEF message start
  // Length byte (payload size)
  // 0xD1 = TNF (well-known) + flags (MB=1, ME=1, SR=1)
  // 0x01 = Type length (1 byte)
  // Payload length
  // 0x54 = Type "T" (Text)
  // 0x02 = Language code length + UTF-8 flag
  // "en" = Language code
  // Text payload
  // 0xFE = NDEF message end
  
  const ndefLength = 7 + textLength; // header + "en" + text
  
  const ndefMessage = Buffer.alloc(ndefLength + 2);
  let offset = 0;
  
  ndefMessage[offset++] = 0x03; // NDEF start
  ndefMessage[offset++] = ndefLength; // Total message length
  ndefMessage[offset++] = 0xD1; // TNF + flags
  ndefMessage[offset++] = 0x01; // Type length
  ndefMessage[offset++] = textLength + 3; // Payload length (includes lang prefix)
  ndefMessage[offset++] = 0x54; // Type "T"
  ndefMessage[offset++] = 0x02; // UTF-8, 2-char language
  ndefMessage[offset++] = 0x65; // 'e'
  ndefMessage[offset++] = 0x6E; // 'n'
  
  // Copy text payload
  textBytes.copy(ndefMessage, offset);
  offset += textLength;
  
  ndefMessage[offset++] = 0xFE; // NDEF end
  
  console.log(`📦 NDEF message size: ${ndefMessage.length} bytes`);
  console.log(`📊 Hex: ${ndefMessage.toString('hex')}`);
  console.log('');
  
  return ndefMessage;
}

// =====================================================
// WRITE TO NFC TAG
// =====================================================

async function writeToTag(reader, data) {
  try {
    console.log('✍️  Writing to tag...');
    
    // NTAG213 starts writing at page 4 (user memory)
    const startPage = 4;
    const pageSize = 4; // NTAG uses 4 bytes per page
    
    // Pad data to page boundary
    const paddedLength = Math.ceil(data.length / pageSize) * pageSize;
    const paddedData = Buffer.alloc(paddedLength);
    data.copy(paddedData);
    
    console.log(`   Writing ${paddedData.length} bytes (${paddedData.length / pageSize} pages)`);
    
    // Write page by page
    for (let i = 0; i < paddedData.length; i += pageSize) {
      const page = startPage + (i / pageSize);
      const pageData = paddedData.slice(i, i + pageSize);
      
      process.stdout.write(`   Page ${page}... `);
      await reader.write(page, pageData);
      console.log('✓');
      
      // Small delay between writes
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('');
    console.log('✅ Write successful!');
    console.log('');
    console.log('🏛️  Council member tag created!');
    console.log(`   You can now tap this tag on the reader to activate ${jsonData.id}`);
    console.log('');
    
    return true;
    
  } catch (error) {
    console.error('❌ Write failed:', error.message);
    return false;
  }
}

// =====================================================
// MAIN PROGRAM
// =====================================================

function startWriter() {
  console.log('\n🏛  CouncilPAD NFC Tag Writer');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Inscribing wisdom onto tags');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const ndefBytes = jsonToNFCBytes(jsonData);
  
  // Check size limits
  if (ndefBytes.length > 180) {
    console.error('❌ JSON too large for NTAG213 (max 180 bytes)');
    console.error(`   Your data: ${ndefBytes.length} bytes`);
    console.error('   Consider using NTAG215 (540 bytes) or NTAG216 (924 bytes)');
    process.exit(1);
  }
  
  const nfc = new NFC();
  
  nfc.on('reader', reader => {
    console.log(`✅ NFC Reader connected: ${reader.reader.name}`);
    console.log('📡 Place a blank NTAG213/215/216 tag on the reader...\n');
    
    let writing = false;
    
    reader.on('card', async card => {
      if (writing) return;
      writing = true;
      
      console.log('🏷️  Tag detected!');
      console.log(`   UID: ${card.uid.toString('hex').toUpperCase()}`);
      console.log(`   Type: ${card.type || 'Unknown'}`);
      console.log('');
      
      const success = await writeToTag(reader, ndefBytes);
      
      if (success) {
        console.log('👋 You can remove the tag now.');
        console.log('');
        process.exit(0);
      } else {
        writing = false;
      }
    });
    
    reader.on('error', err => {
      console.error(`❌ Reader error: ${err.message}`);
    });
  });
  
  nfc.on('error', err => {
    console.error(`❌ NFC error: ${err.message}\n`);
    console.log('💡 Troubleshooting:');
    console.log('   1. Ensure ACR122U reader is connected via USB');
    console.log('   2. Check that PC/SC daemon is running');
    console.log('   3. Try a different USB port\n');
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Writer cancelled.\n');
    process.exit(0);
  });
}

// =====================================================
// START
// =====================================================

startWriter();

