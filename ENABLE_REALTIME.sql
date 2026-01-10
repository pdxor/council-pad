-- Enable Realtime for NFC payloads table
-- Run this in your Supabase SQL Editor

-- Enable realtime on the nfc_payloads table
ALTER PUBLICATION supabase_realtime ADD TABLE nfc_payloads;

-- Verify it's enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

