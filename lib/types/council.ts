// Core TypeScript types for CouncilPAD v1.1

export type PromptFragmentCategory = 
  | 'axiom'
  | 'role'
  | 'tone_modifier'
  | 'synthesis_strategy'
  | 'worldview'
  | 'principle';

export type CouncilPreset = 
  | 'integrative_wisdom'
  | 'regenerative_lens'
  | 'psychological_depth'
  | 'systems_feedback'
  | 'radical_truth'
  | 'custom';

export type QuestionCategory = 
  | 'civilization_ecology'
  | 'psyche_meaning'
  | 'governance_power'
  | 'design_technology'
  | 'regeneration_healing'
  | 'meta';

export type OutputFormat = 
  | 'narrative'
  | 'bullet_synthesis'
  | 'action_principles'
  | 'reflective_prompts';

// ============================================================
// NFC PAYLOAD STRUCTURE (as stored on NTAG213 chips)
// ============================================================

export interface NFCPayload {
  id: string;                    // e.g., "buckminster_fuller"
  role: string;                  // e.g., "systems_designer"
  tone: string[];                // e.g., ["optimistic", "precise", "global"]
  axioms: string[];              // e.g., ["whole_systems", "ephemeralization"]
  priority?: number;             // 0.0-2.0, defaults to 1.0
}

// ============================================================
// DATABASE TYPES
// ============================================================

export interface PromptFragment {
  id: string;
  content: string;
  category: PromptFragmentCategory;
  metadata?: Record<string, any>;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface NFCPayloadRecord {
  id: string;
  nfc_tag_id: string;
  raw_payload: NFCPayload;
  parsed_axioms: string[];
  parsed_roles: string[];
  parsed_tones: string[];
  priority: number;
  statue_name?: string;
  last_scanned_at: string;
  created_at: string;
}

export interface SessionSettings {
  preserve_disagreement: boolean;
  highlight_minority: boolean;
  avoid_moralizing: boolean;
  prioritize_nonhuman: boolean;
  generate_followups: boolean;
  output_format: OutputFormat;
}

export interface Session {
  id: string;
  user_id?: string;
  preset: CouncilPreset;
  settings: SessionSettings;
  active_nfc_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  category: QuestionCategory;
  subcategory?: string;
  tags: string[];
  usage_count: number;
  created_at: string;
}

export interface Response {
  id: string;
  session_id: string;
  question_text: string;
  assembled_prompt: string;
  response_text: string;
  active_fragments: string[];
  preset_used?: string;
  tokens_used?: number;
  created_at: string;
}

// ============================================================
// RUNTIME TYPES (used during prompt assembly)
// ============================================================

export interface ActiveCouncilMember {
  nfc_tag_id: string;
  payload: NFCPayload;
  statue_name?: string;
  priority: number;
}

export interface AssembledPrompt {
  system_prompt: string;
  active_fragments: PromptFragment[];
  active_members: ActiveCouncilMember[];
  preset: CouncilPreset;
  settings: SessionSettings;
}

export interface CouncilRequest {
  question: string;
  session_id?: string;
  active_nfc_tags: string[];
  preset?: CouncilPreset;
  settings?: Partial<SessionSettings>;
}

export interface CouncilResponse {
  response_text: string;
  assembled_prompt: string;
  active_fragments: string[];
  tokens_used: number;
  session_id: string;
  response_id: string;
}

// ============================================================
// PRESET DEFINITIONS
// ============================================================

export interface PresetDefinition {
  id: CouncilPreset;
  name: string;
  description: string;
  icon: string;
  emphasis: {
    axioms?: string[];
    roles?: string[];
    synthesis_strategy: string;
  };
  settings_override?: Partial<SessionSettings>;
}

export const COUNCIL_PRESETS: Record<CouncilPreset, PresetDefinition> = {
  integrative_wisdom: {
    id: 'integrative_wisdom',
    name: 'Integrative Wisdom',
    description: 'Balanced synthesis that preserves tensions between perspectives',
    icon: '🕊',
    emphasis: {
      synthesis_strategy: 'integrative_wisdom_synthesis',
    },
    settings_override: {
      preserve_disagreement: true,
      highlight_minority: false,
    },
  },
  regenerative_lens: {
    id: 'regenerative_lens',
    name: 'Regenerative Lens',
    description: 'Prioritizes ecology, long-term health, and restoration',
    icon: '🌱',
    emphasis: {
      axioms: ['deep_ecology', 'regenerative_design', 'seven_generations'],
      synthesis_strategy: 'regenerative_lens_synthesis',
    },
    settings_override: {
      prioritize_nonhuman: true,
    },
  },
  psychological_depth: {
    id: 'psychological_depth',
    name: 'Psychological Depth',
    description: 'Emphasizes unconscious patterns, symbolism, and shadow',
    icon: '🧠',
    emphasis: {
      axioms: ['archetypal_psychology', 'shadow_integration'],
      roles: ['depth_psychologist', 'mystic'],
      synthesis_strategy: 'psychological_depth_synthesis',
    },
  },
  systems_feedback: {
    id: 'systems_feedback',
    name: 'Systems & Feedback',
    description: 'Focuses on structure, leverage points, and second-order effects',
    icon: '🕸',
    emphasis: {
      axioms: ['whole_systems', 'edge_of_chaos'],
      roles: ['systems_designer', 'complexity_scientist'],
      synthesis_strategy: 'systems_feedback_synthesis',
    },
  },
  radical_truth: {
    id: 'radical_truth',
    name: 'Radical Truth',
    description: 'Strips comfort narratives and names power dynamics',
    icon: '🔥',
    emphasis: {
      axioms: ['power_analysis', 'structural_violence'],
      roles: ['political_economist'],
      synthesis_strategy: 'radical_truth_synthesis',
    },
    settings_override: {
      avoid_moralizing: true,
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'User-defined configuration',
    icon: '⚙️',
    emphasis: {
      synthesis_strategy: 'integrative_wisdom_synthesis',
    },
  },
};

// ============================================================
// QUESTION CATEGORIES
// ============================================================

export const QUESTION_CATEGORIES: Record<QuestionCategory, { name: string; icon: string; description: string }> = {
  civilization_ecology: {
    name: 'Civilization & Ecology',
    icon: '🌍',
    description: 'Questions about planetary systems, limits, and long-term survival',
  },
  psyche_meaning: {
    name: 'Psyche & Meaning',
    icon: '🧠',
    description: 'Questions about psychological patterns, symbolism, and depth',
  },
  governance_power: {
    name: 'Governance & Power',
    icon: '🏛',
    description: 'Questions about structures, justice, and who decides',
  },
  design_technology: {
    name: 'Design & Technology',
    icon: '🛠',
    description: 'Questions about systems design and technological solutions',
  },
  regeneration_healing: {
    name: 'Regeneration & Healing',
    icon: '🌱',
    description: 'Questions about restoration, ceremony, and transformation',
  },
  meta: {
    name: 'Meta',
    icon: '🔮',
    description: 'Questions about questioning itself',
  },
};

