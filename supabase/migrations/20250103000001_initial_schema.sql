-- CouncilPAD v1.1 Database Schema
-- Migration: Initial setup for NFC-embedded system prompts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROMPT FRAGMENTS TABLE
-- Stores reusable prompt building blocks (axioms, worldviews)
-- ============================================================
CREATE TABLE prompt_fragments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'axiom',
    'role',
    'tone_modifier',
    'synthesis_strategy',
    'worldview',
    'principle'
  )),
  metadata JSONB DEFAULT '{}',
  priority NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category lookups
CREATE INDEX idx_prompt_fragments_category ON prompt_fragments(category);
CREATE INDEX idx_prompt_fragments_priority ON prompt_fragments(priority DESC);

-- ============================================================
-- NFC PAYLOADS TABLE
-- Stores parsed NFC tag data from physical statues
-- ============================================================
CREATE TABLE nfc_payloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nfc_tag_id TEXT UNIQUE NOT NULL,
  raw_payload JSONB NOT NULL,
  parsed_axioms TEXT[] DEFAULT '{}',
  parsed_roles TEXT[] DEFAULT '{}',
  parsed_tones TEXT[] DEFAULT '{}',
  priority NUMERIC DEFAULT 1.0,
  statue_name TEXT,
  last_scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast NFC lookups
CREATE INDEX idx_nfc_payloads_tag_id ON nfc_payloads(nfc_tag_id);
CREATE INDEX idx_nfc_payloads_last_scanned ON nfc_payloads(last_scanned_at DESC);

-- ============================================================
-- SESSIONS TABLE
-- Tracks council sessions and their configurations
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preset TEXT CHECK (preset IN (
    'integrative_wisdom',
    'regenerative_lens',
    'psychological_depth',
    'systems_feedback',
    'radical_truth',
    'custom'
  )) DEFAULT 'integrative_wisdom',
  settings JSONB DEFAULT '{
    "preserve_disagreement": true,
    "highlight_minority": false,
    "avoid_moralizing": false,
    "prioritize_nonhuman": false,
    "generate_followups": true,
    "output_format": "narrative"
  }',
  active_nfc_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- ============================================================
-- QUESTIONS TABLE
-- Universal question library
-- ============================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'civilization_ecology',
    'psyche_meaning',
    'governance_power',
    'design_technology',
    'regeneration_healing',
    'meta'
  )),
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_usage ON questions(usage_count DESC);

-- ============================================================
-- RESPONSES TABLE
-- Stores council responses for session memory
-- ============================================================
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  assembled_prompt TEXT NOT NULL,
  response_text TEXT NOT NULL,
  active_fragments TEXT[] DEFAULT '{}',
  preset_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session history
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_created_at ON responses(created_at DESC);

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE prompt_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Prompt fragments: readable by all, writable by admins only
CREATE POLICY "Prompt fragments are publicly readable"
  ON prompt_fragments FOR SELECT
  USING (true);

-- NFC payloads: readable by all, insertable by authenticated users
CREATE POLICY "NFC payloads are publicly readable"
  ON nfc_payloads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert NFC payloads"
  ON nfc_payloads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own NFC payloads"
  ON nfc_payloads FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Sessions: users can only see/modify their own
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Questions: readable by all
CREATE POLICY "Questions are publicly readable"
  ON questions FOR SELECT
  USING (true);

-- Responses: users can only see responses from their sessions
CREATE POLICY "Users can view own responses"
  ON responses FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

CREATE POLICY "Users can insert responses"
  ON responses FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompt_fragments_updated_at
  BEFORE UPDATE ON prompt_fragments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

