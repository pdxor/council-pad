-- Fix RLS policy for NFC payloads to allow service role inserts
-- Run this in Supabase SQL Editor

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert NFC payloads" ON nfc_payloads;

-- Create a permissive policy that allows inserts from service role or anon
CREATE POLICY "Allow NFC payload inserts"
  ON nfc_payloads FOR INSERT
  WITH CHECK (true);

-- Also make sure updates work for existing payloads
DROP POLICY IF EXISTS "Users can update their own NFC payloads" ON nfc_payloads;

CREATE POLICY "Allow NFC payload updates"
  ON nfc_payloads FOR UPDATE
  USING (true)
  WITH CHECK (true);

