/**
 * CouncilPAD NFC Service Integration
 * 
 * Modified service to read NFC tags and store council member data
 */

require('dotenv').config();
const { NFC } = require('nfc-pcsc');
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// CONFIGURATION
// =====================================================

const config = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.supabaseurl,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.servicerolekey || process.env.SUPABASE_KEY || process.env.publishableapiKey,
  debug: process.env.DEBUG === 'true',
};

// Validate configuration
if (!config.supabaseUrl || !config.supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('   Required: SUPABASE_URL (or supabaseurl) and SUPABASE_KEY (or publishableapiKey)');
  console.error('   Found in environment:');
  console.error('   - supabaseurl:', process.env.supabaseurl || 'NOT SET');
  console.error('   - publishableapiKey:', process.env.publishableapiKey ? 'SET' : 'NOT SET');
  process.exit(1);
}

// =====================================================
// INITIALIZE SUPABASE CLIENT
// =====================================================

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// =====================================================
// NFC TAG UID FORMATTER
// =====================================================

function formatUID(uid) {
  if (!uid) return 'UNKNOWN';
  if (typeof uid === 'string') return uid.toUpperCase();
  
  try {
    return Array.from(uid)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  } catch (e) {
    console.error('❌ Error formatting UID:', e.message);
    return 'ERROR';
  }
}

// =====================================================
// STORE NFC PAYLOAD IN DATABASE
// =====================================================

async function storeNFCPayload(nfcTagId, payloadText) {
  try {
    // Parse the JSON payload from the NFC tag
    const payload = JSON.parse(payloadText);
    
    console.log(`\n📦 Parsed Payload:`);
    console.log(`   ID: ${payload.id}`);
    console.log(`   Role: ${payload.role}`);
    console.log(`   Axioms: ${payload.axioms.join(', ')}`);
    console.log(`   Priority: ${payload.priority}`);

    // Store in nfc_payloads table
    const { data, error } = await supabase
      .from('nfc_payloads')
      .upsert({
        nfc_tag_id: nfcTagId,
        raw_payload: payload,
        parsed_axioms: payload.axioms,
        parsed_roles: [payload.role],
        parsed_tones: payload.tone,
        priority: payload.priority || 1.0,
        statue_name: payload.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        last_scanned_at: new Date().toISOString(),
      }, {
        onConflict: 'nfc_tag_id',
      });

    if (error) {
      console.error('❌ Error storing to database:', error.message);
      return false;
    }

    console.log(`✅ Council member stored in database!`);
    console.log(`   Ready to use in CouncilPAD app`);
    return true;

  } catch (error) {
    console.error('❌ Error parsing or storing payload:', error.message);
    return false;
  }
}

// =====================================================
// MAIN NFC SERVICE
// =====================================================

function startNFCService() {
  console.log('\n🏛  CouncilPAD NFC Service v1.1');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Where wisdom becomes present');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const nfc = new NFC();

  // Reader detected
  nfc.on('reader', reader => {
    console.log(`✅ NFC Reader connected: ${reader.reader.name}`);
    console.log(`👂 Ready to read council member tags...\n`);

    // Card detected
    reader.on('card', async card => {
      const hardwareUID = formatUID(card.uid);
      console.log(`\n🏷️  NFC Tag Detected!`);
      console.log(`   Hardware UID: ${hardwareUID}`);
      console.log(`   Type: ${card.type || 'Unknown'}`);

      // Read NDEF data from the tag
      try {
        console.log('\n📖 Reading council member data...');
        
        // NTAG213 has 180 bytes total user memory (pages 4-44)
        // Let's read ALL of it to ensure we get the complete JSON
        const startPage = 4;
        const bytesToRead = 200; // Read full capacity + some extra
        
        console.log(`   Reading ${bytesToRead} bytes starting from page ${startPage}...`);
        
        let fullData;
        try {
          fullData = await reader.read(startPage, bytesToRead);
        } catch (readErr) {
          // If reading 200 fails, try 180
          console.log(`   Trying smaller read size...`);
          fullData = await reader.read(startPage, 180);
        }
        
        console.log(`📊 Read ${fullData.length} bytes`);
        console.log(`📊 Hex (first 80 bytes): ${fullData.slice(0, 80).toString('hex')}`);
        console.log(`📊 Hex (bytes 80-160): ${fullData.slice(80, 160).toString('hex')}`);
        
        // Convert to UTF-8
        let rawText = fullData.toString('utf8');
        console.log(`📝 Raw text (first 100 chars): ${rawText.substring(0, 100).replace(/[\x00-\x1F]/g, '·')}`);
        console.log(`📝 Raw text (chars 100-200): ${rawText.substring(100, 200).replace(/[\x00-\x1F]/g, '·')}`);
        console.log(`📝 Total raw text length: ${rawText.length} characters`);
        
        // Strategy: Find ALL occurrences of { and }, pick the best match
        let textData = null;
        
        // Replace null bytes first (they terminate strings early)
        const cleanedForSearch = rawText.replace(/\x00/g, ' ');
        
        // Find the opening brace
        const jsonStart = cleanedForSearch.indexOf('{');
        
        if (jsonStart >= 0) {
          console.log(`✅ Found opening { at position ${jsonStart}`);
          
          // Look for closing brace using brace counting
          let jsonEnd = -1;
          let braceCount = 0;
          
          for (let i = jsonStart; i < cleanedForSearch.length; i++) {
            if (cleanedForSearch[i] === '{') braceCount++;
            if (cleanedForSearch[i] === '}') {
              braceCount--;
              if (braceCount === 0) {
                jsonEnd = i;
                console.log(`✅ Found matching closing } at position ${jsonEnd}`);
                break;
              }
            }
          }
          
          if (jsonEnd > jsonStart) {
            // Extract everything between { and }
            const extracted = cleanedForSearch.substring(jsonStart, jsonEnd + 1);
            
            console.log(`📏 Extracted ${extracted.length} characters`);
            
            // Clean: Remove control characters but keep structure
            const cleaned = extracted
              .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '') // Remove control chars
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
            
            console.log(`✅ Cleaned JSON (length: ${cleaned.length} chars)`);
            console.log(`   Full JSON: ${cleaned}`);
            
            if (cleaned.includes('"id"') && cleaned.startsWith('{') && cleaned.endsWith('}')) {
              textData = cleaned;
              console.log(`✅ JSON validation passed!`);
            }
          } else {
            console.log(`❌ Could not find matching closing }`);
            console.log(`   Open braces at end: ${braceCount}`);
            console.log(`   Full text for inspection:`);
            console.log(cleanedForSearch.replace(/[\x00-\x1F]/g, '·'));
          }
        } else {
          console.log(`⚠️ No opening brace { found in data`);
        }

        if (textData) {
          console.log(`\n📄 Extracted JSON (first 100 chars): ${textData.substring(0, 100)}`);
          
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(textData);
            if (parsed.id) {
              console.log(`\n📦 Parsed Payload:`);
              console.log(`   ID: ${parsed.id}`);
              console.log(`   Role: ${parsed.role || 'N/A'}`);
              console.log(`   Tone: ${parsed.tone ? parsed.tone.join(', ') : 'N/A'}`);
              console.log(`   Axioms: ${parsed.axioms ? parsed.axioms.join(', ') : 'N/A'}`);
              console.log(`   Priority: ${parsed.priority || 'N/A'}`);
              
              const success = await storeNFCPayload(hardwareUID, textData);
              
              if (success) {
                console.log(`\n✨ Council member activated!`);
                console.log(`   Refresh the CouncilPAD app to see this member`);
              }
            } else {
              console.log(`⚠️  JSON missing required "id" field`);
            }
          } catch (parseError) {
            console.log(`❌ Could not parse JSON: ${parseError.message}`);
            console.log(`   Cleaned data: ${textData}`);
          }
        } else {
          console.log(`\n⚠️  Could not find JSON data in tag`);
          console.log(`   Raw text dump: ${rawText.substring(0, 200).replace(/[\x00-\x1F]/g, '·')}`);
        }
      } catch (readError) {
        console.error(`❌ Could not read tag: ${readError.message}`);
        console.error(`   Error stack: ${readError.stack}`);
      }

      console.log('\n' + '─'.repeat(50) + '\n');
    });

    // Card removed
    reader.on('card.off', card => {
      const uid = formatUID(card.uid);
      if (config.debug) {
        console.log(`👋 Tag removed: ${uid}\n`);
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
    console.log('   2. Check that PC/SC daemon is running');
    console.log('   3. Try a different USB port');
    console.log('   4. Restart the service\n');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down CouncilPAD NFC Service...');
    console.log('   May your councils be wise. 🏛✨\n');
    process.exit(0);
  });
}

// =====================================================
// START THE SERVICE
// =====================================================

startNFCService();

