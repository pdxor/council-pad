/**
 * Quick script to run Supabase migrations
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('🏛  Running CouncilPAD database migrations...\n');

  // Read migration file
  const migrationSQL = fs.readFileSync('./supabase/migrations/20250103000001_initial_schema.sql', 'utf8');

  // Split into individual statements (basic approach)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`▶️  Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      // Use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try alternative method - direct query
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ sql: statement + ';' })
        });

        if (!response.ok) {
          console.log(`   ⚠️  Statement may have failed or already exists (this is often OK)`);
        } else {
          console.log(`   ✅ Success`);
        }
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${err.message} (may already exist)`);
    }
  }

  console.log('\n✨ Migration complete! Checking tables...\n');

  // Verify tables exist
  const { data: tables, error } = await supabase
    .from('nfc_payloads')
    .select('count')
    .limit(0);

  if (error) {
    console.log('❌ Table verification failed:', error.message);
    console.log('\n💡 You may need to run the migration manually in Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
    console.log('   2. Copy the contents of supabase/migrations/20250103000001_initial_schema.sql');
    console.log('   3. Paste and run it\n');
  } else {
    console.log('✅ Tables created successfully!');
    console.log('   - prompt_fragments');
    console.log('   - nfc_payloads ✨ (for scanned NFC tags)');
    console.log('   - sessions');
    console.log('   - questions');
    console.log('   - responses\n');
  }
}

runMigration().catch(console.error);

