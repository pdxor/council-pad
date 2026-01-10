# CouncilPAD v1.1 — Setup Guide

## 🎯 Overview

CouncilPAD v1.1 is a **physical-digital thinking instrument** that uses NFC-embedded statues to create composite AI intelligence. Each statue carries a compressed worldview, and the system prompt is dynamically assembled from their physical presence.

> *"The prompt is no longer written by a developer—it is assembled by presence."*

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

The database credentials are already configured in `.env`. Run the migrations:

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

Or manually run the SQL files in Supabase Studio:
- `supabase/migrations/20250103000001_initial_schema.sql`
- `supabase/migrations/20250103000002_seed_data.sql`

### 3. Configure OpenAI (Optional for Development)

Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=your_key_here
```

In development mode, the app uses mock responses if no key is provided.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Database Schema

### Tables

- **`prompt_fragments`** — Reusable prompt building blocks (axioms, roles, tones)
- **`nfc_payloads`** — Parsed NFC tag data from physical statues
- **`sessions`** — Council sessions with configurations
- **`questions`** — Universal question library
- **`responses`** — Council responses with metadata

### Seeded Data

The system comes pre-loaded with:
- 16 **axiom fragments** (systems thinking, ecology, psychology, power analysis)
- 8 **role perspectives** (systems designer, depth psychologist, indigenous elder, etc.)
- 6 **tone modifiers** (optimistic, precise, unsentimental, etc.)
- 5 **synthesis strategies** (one for each preset)
- 25+ **universal questions** across 6 categories

---

## 🧩 NFC Payload Format

Each NFC tag (NTAG213, ~144 bytes) stores:

```json
{
  "id": "buckminster_fuller",
  "role": "systems_designer",
  "tone": ["optimistic", "precise", "global"],
  "axioms": ["whole_systems", "ephemeralization", "design_science"],
  "priority": 1.2
}
```

### Mock Statues (Development)

5 pre-configured mock statues are available:
- Buckminster Fuller
- Carl Jung
- Donella Meadows
- Robin Wall Kimmerer
- James Baldwin

---

## 🎨 Council Presets

| Preset | Description | Icon |
|--------|-------------|------|
| **Integrative Wisdom** | Balanced synthesis, preserves tensions | 🕊 |
| **Regenerative Lens** | Ecology, long-term health, restoration | 🌱 |
| **Psychological Depth** | Unconscious patterns, shadow, symbolism | 🧠 |
| **Systems & Feedback** | Leverage points, feedback loops | 🕸 |
| **Radical Truth** | Power analysis, stripped narratives | 🔥 |

---

## 🛠 Architecture

### Prompt Assembly Flow

1. **NFC Scan** → Parse payload from tag
2. **Member Activation** → Store in `nfc_payloads` table
3. **Fragment Collection** → Gather axioms, roles, tones from payloads + preset
4. **Prompt Construction** → Assemble system prompt from fragments
5. **OpenAI Query** → Send question + assembled prompt
6. **Response Storage** → Save to `responses` table

### Key Files

```
lib/
  ├── types/council.ts          # TypeScript types
  ├── supabase.ts               # Supabase client
  └── engines/
      ├── prompt-assembler.ts   # Core prompt assembly logic
      ├── nfc-reader.ts         # Web NFC API wrapper
      └── openai-client.ts      # OpenAI integration

components/council/
  ├── CouncilTable.tsx          # Visual council grid
  ├── NFCScanner.tsx            # NFC scanning interface
  ├── QuestionLibrary.tsx       # Universal questions
  ├── CouncilPresets.tsx        # Preset selector
  └── AdvancedSettings.tsx      # Power user settings

app/
  ├── page.tsx                  # Main application
  └── api/
      ├── council/query/        # Query endpoint
      ├── sessions/             # Session management
      └── questions/            # Question library API
```

---

## 🔮 Advanced Features

### Session Settings

- **Preserve Disagreement** — Keep tensions visible
- **Highlight Minority Views** — Surface overlooked perspectives
- **Avoid Moralizing** — Focus on structural analysis
- **Prioritize Non-Human** — Center the more-than-human world
- **Generate Follow-ups** — Add deepening questions

### Output Formats

- **Narrative** — Woven prose
- **Bullet Synthesis** — Key insights per perspective
- **Action Principles** — Actionable wisdom
- **Reflective Prompts** — Questions for deeper thinking

---

## 🌐 Web NFC Support

Web NFC API is currently **only supported on Android Chrome**. For iOS/desktop:
- Use the development mode mock statues
- Or implement a custom NFC reader (React Native, native app)

---

## 📝 Adding Custom Fragments

Insert new fragments via Supabase Studio or SQL:

```sql
INSERT INTO prompt_fragments (id, content, category, priority) VALUES
('your_axiom_id', 
 'Your axiom description...', 
 'axiom', 
 1.0);
```

Categories: `axiom`, `role`, `tone_modifier`, `synthesis_strategy`, `worldview`, `principle`

---

## 🔒 Security Notes

- RLS (Row Level Security) is enabled on all tables
- Anonymous users can read prompt fragments and questions
- Session data is isolated per user (if auth is added)
- NFC payloads are publicly readable but validated on write

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
OPENAI_API_KEY=your_production_key
NODE_ENV=production
```

---

## 🎯 Future Extensions

- Writable NFC (edit axioms via UI)
- User-created custom statues
- Council conflict visualization
- Temporal councils (past/future thinkers)
- Multi-pad networked councils
- Public installations / museums
- Voice input for questions
- Streaming responses (real-time)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### NFC not working
- Ensure you're on Android Chrome
- Check NFC is enabled in device settings
- Use mock mode for development

### OpenAI errors
- Verify `OPENAI_API_KEY` is set
- Check API key has GPT-4 access
- Set `use_mock: true` in query for dev mode

### Database connection errors
- Verify Supabase project is active
- Check migrations have been applied
- Confirm RLS policies allow access

---

## 📚 Philosophy

This is not a chatbot. It's a **thinking instrument**.

The council becomes a *composable epistemology*—a way of assembling intelligence from portable worldviews. Each statue is an epistemic artifact that carries compressed wisdom. Physical presence influences cognitive output.

The system honors:
- **Plurality** over singular truth
- **Tension** over false harmony
- **Mystery** over premature closure
- **Embodiment** over abstraction

---

## 🙏 Credits

Built for the CouncilPAD project.
Inspired by collective intelligence, systems thinking, and embodied epistemology.

---

**Version:** 1.1  
**Last Updated:** January 3, 2026

