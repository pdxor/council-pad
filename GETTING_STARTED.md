# 🏛 CouncilPAD v1.1 — Getting Started

## What You Just Built

A **physical-digital thinking instrument** where:
- NFC statues carry compressed worldviews
- System prompts are assembled from physical presence
- AI becomes composite intelligence, not singular authority

> *"The prompt is no longer written by a developer—it is assembled by presence."*

---

## ⚡ Quick Start (5 minutes)

### 1. Set Up Database

```bash
# Option A: Automatic (recommended)
./setup-db.sh

# Option B: Manual
# 1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
# 2. Paste contents of supabase/migrations/20250103000001_initial_schema.sql
# 3. Run it
# 4. Paste contents of supabase/migrations/20250103000002_seed_data.sql
# 5. Run it
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open Application

Visit [http://localhost:3000](http://localhost:3000)

---

## 🎮 How to Use (Development Mode)

### Adding Council Members

1. Click the **"Select a statue"** dropdown in the NFC Scanner
2. Choose from 5 pre-loaded mock statues:
   - **Buckminster Fuller** — Systems designer (whole systems, ephemeralization)
   - **Carl Jung** — Depth psychologist (archetypes, shadow)
   - **Donella Meadows** — Systems thinker (leverage points, limits to growth)
   - **Robin Wall Kimmerer** — Ecological thinker (indigenous wisdom, reciprocity)
   - **James Baldwin** — Philosopher (power analysis, situated knowledge)

3. Click **"Add Selected Statue"**
4. Watch the council circle light up! ✨

### Asking Questions

**Option 1: Use the Question Library**
1. Click **"Show Question Library"**
2. Browse by category:
   - 🌍 Civilization & Ecology
   - 🧠 Psyche & Meaning
   - 🏛 Governance & Power
   - 🛠 Design & Technology
   - 🌱 Regeneration & Healing
   - 🔮 Meta
3. Click a question to auto-fill

**Option 2: Write Your Own**
- Type directly in the text area

### Choosing a Lens

Select a **Council Preset** to emphasize certain perspectives:

- **🕊 Integrative Wisdom** (Default) — Balanced, preserves tensions
- **🌱 Regenerative Lens** — Ecology-focused, long-term thinking
- **🧠 Psychological Depth** — Unconscious patterns, shadow work
- **🕸 Systems & Feedback** — Leverage points, second-order effects
- **🔥 Radical Truth** — Power analysis, stripped narratives

### Advanced Settings

Expand the **Advanced Settings** panel to customize:

**Response Style:**
- ☑ Preserve Disagreement
- ☐ Highlight Minority Views
- ☐ Avoid Moralizing Language
- ☐ Prioritize Non-Human Perspectives
- ☑ Generate Follow-up Questions

**Output Format:**
- ⦿ Narrative (woven prose)
- ○ Bullet Points (key insights)
- ○ Action Principles (actionable wisdom)
- ○ Reflective Questions (deeper inquiry)

---

## 🧪 Example Session

### Try This:

1. **Add 3 statues:**
   - Robin Wall Kimmerer
   - Donella Meadows
   - James Baldwin

2. **Choose preset:**
   - 🌱 Regenerative Lens

3. **Ask:**
   - "What would a regenerative response look like?"
   - or "How do we restore right relationship here?"

4. **Observe:**
   - The assembled prompt combines indigenous worldview + systems thinking + power analysis
   - Response synthesizes multiple perspectives
   - Follow-up questions deepen inquiry

---

## 🔧 Architecture Overview

### What Happens When You Ask a Question:

```
1. NFC Scanner → Parse statue payload
                ↓
2. Supabase   → Fetch prompt fragments (axioms, roles, tones)
                ↓
3. Assembler  → Construct system prompt from fragments + preset
                ↓
4. OpenAI     → Query GPT-4 with assembled prompt + question
                ↓
5. Response   → Store in database + display to user
```

### Key Concepts:

**Prompt Fragments** — Reusable building blocks stored in database:
- **Axioms** — Core principles (whole_systems, deep_ecology, shadow_integration)
- **Roles** — Perspectives (systems_designer, depth_psychologist, indigenous_elder)
- **Tones** — Voice qualities (optimistic, unsentimental, humble)
- **Synthesis** — How to integrate perspectives

**NFC Payload** — Compressed worldview on each statue (~144 bytes):
```json
{
  "id": "buckminster_fuller",
  "role": "systems_designer",
  "tone": ["optimistic", "precise"],
  "axioms": ["whole_systems", "ephemeralization"],
  "priority": 1.2
}
```

**Prompt Assembly** — Dynamic construction:
1. Collect fragment IDs from active statues + preset
2. Fetch fragments from database
3. Apply preset weighting (emphasize certain fragments)
4. Order by category + priority
5. Construct system prompt with settings

---

## 🌐 Production Setup

### Add OpenAI API Key

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Then in `app/page.tsx`, change:
```typescript
use_mock: true  →  use_mock: false
```

### Deploy to Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NODE_ENV=production`

---

## 📱 Physical NFC Tags (Future)

### Hardware Requirements:
- **NFC Tags:** NTAG213 (144 bytes usable)
- **Supported Devices:** Android with Chrome browser
- **Tag Placement:** Embedded in statue bases

### Programming Tags:

Use an NFC writing app (like **NFC Tools**) to write NDEF text records:

```json
{
  "id": "buckminster_fuller",
  "role": "systems_designer",
  "tone": ["optimistic", "precise", "global"],
  "axioms": ["whole_systems", "ephemeralization", "design_science"],
  "priority": 1.2
}
```

### Web NFC API:

Currently only supported on **Android Chrome**. The app will:
1. Request NFC permissions
2. Start scanning
3. Read NDEF text record
4. Parse JSON payload
5. Store in Supabase
6. Activate in council

---

## 🎨 Customization

### Adding Custom Prompt Fragments

Via Supabase Studio or SQL:

```sql
INSERT INTO prompt_fragments (id, content, category, priority) VALUES
('biomimicry', 
 'Look to nature for design patterns refined over 3.8 billion years of evolution. Seek solutions that are elegant, efficient, and regenerative.',
 'axiom',
 1.1);
```

### Creating Custom Statues

Add to mock payloads in `lib/engines/nfc-reader.ts`:

```typescript
export const MOCK_NFC_PAYLOADS = {
  // ...existing
  'custom_thinker': {
    id: 'custom_thinker',
    role: 'philosopher',
    tone: ['humble', 'precise'],
    axioms: ['negative_capability', 'situated_knowledge'],
    priority: 1.0,
  },
};
```

### Modifying Presets

Edit `lib/types/council.ts`:

```typescript
export const COUNCIL_PRESETS = {
  // ...existing presets
  custom_preset: {
    id: 'custom_preset',
    name: 'Custom Lens',
    description: 'Your description',
    icon: '🔮',
    emphasis: {
      axioms: ['your_axiom_ids'],
      roles: ['your_role_ids'],
      synthesis_strategy: 'your_synthesis_strategy',
    },
  },
};
```

---

## 🐛 Troubleshooting

### "No active members found"
- Make sure you've added at least one statue via the NFC Scanner
- Check that the statue appears in the council circle (lit up seat)

### "At least one NFC tag must be active"
- Add statues before asking questions
- Verify statues are stored (check browser console for errors)

### Mock responses showing in production
- Set `use_mock: false` in `app/page.tsx`
- Add valid OpenAI API key to `.env.local`
- Restart dev server

### Database connection errors
- Verify `.env.local` exists with Supabase credentials
- Check migrations ran successfully (`./setup-db.sh`)
- Confirm tables exist in Supabase Studio

---

## 🧠 Philosophy

This is **not a chatbot**. It's a **thinking instrument**.

### Design Principles:

1. **Presence Over Programming**
   - Intelligence assembled from physical artifacts
   - Portable worldviews, not hardcoded prompts

2. **Plurality Over Singularity**
   - Multiple perspectives, not one authority
   - Tensions preserved, not harmonized

3. **Ritual Over Utility**
   - Physical engagement matters
   - Embodied epistemology

4. **Emergence Over Control**
   - Composite intelligence arises from configuration
   - Designer curates, doesn't dictate

### What Makes This Different:

- **Traditional AI:** Developer writes prompt → AI responds
- **CouncilPAD:** User arranges statues → Prompt assembles itself → Composite intelligence emerges

The council becomes a **thinking space**, not a answer machine.

---

## 📚 Next Steps

### Extend the System:

1. **Add more thinkers** — Create fragments for figures like:
   - Ursula K. Le Guin (narrative wisdom)
   - Ivan Illich (convivial tools)
   - Joanna Macy (deep time)
   - Bayo Akomolafe (post-activism)

2. **Create specialized councils** — Preset configurations for:
   - Climate strategy council
   - Organizational transformation
   - Personal discernment
   - Policy evaluation

3. **Build visualization** — Show fragment influence, tension maps, minority views

4. **Multi-modal input** — Voice questions, image context

5. **Session memory** — Track inquiry evolution over time

---

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Different statue configurations produce meaningfully different responses
- ✅ Tensions between perspectives are visible (not artificially resolved)
- ✅ Responses feel like *synthesis* not *averaging*
- ✅ The physical ritual of adding statues feels meaningful
- ✅ Users ask better questions over time

---

## 💬 Support

Issues? Questions? Insights?

Check:
- `README.md` — Full technical documentation
- `supabase/migrations/` — Database schema
- `lib/engines/prompt-assembler.ts` — Core assembly logic

---

**Version:** 1.1  
**Status:** Development Ready  
**Last Updated:** January 3, 2026

*May your councils be wise and your questions be deep.* 🏛✨

