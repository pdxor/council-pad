/**
 * CouncilPAD Prompt Assembly Engine
 * 
 * This engine dynamically constructs OpenAI system prompts by:
 * 1. Reading active NFC tags from the council
 * 2. Fetching corresponding prompt fragments from Supabase
 * 3. Applying preset modifiers and synthesis strategies
 * 4. Assembling a coherent, composite system prompt
 * 
 * The prompt is no longer written by a developer—it is assembled by presence.
 */

import { supabase } from '../supabase';
import type {
  NFCPayload,
  PromptFragment,
  ActiveCouncilMember,
  AssembledPrompt,
  CouncilPreset,
  SessionSettings,
  PresetDefinition,
} from '../types/council';
import { COUNCIL_PRESETS } from '../types/council';

// ============================================================
// CORE PROMPT ASSEMBLY
// ============================================================

export class PromptAssembler {
  private fragmentCache: Map<string, PromptFragment> = new Map();

  /**
   * Main assembly method: takes active NFC tags and constructs a system prompt
   */
  async assemblePrompt(
    activeMembers: ActiveCouncilMember[],
    preset: CouncilPreset = 'integrative_wisdom',
    settings: SessionSettings
  ): Promise<AssembledPrompt> {
    // 1. Collect all fragment IDs from active members
    const fragmentIds = this.collectFragmentIds(activeMembers, preset);

    // 2. Fetch fragments from Supabase (with caching)
    const fragments = await this.fetchFragments(fragmentIds);

    // 3. Apply preset emphasis (weight certain fragments higher)
    const weightedFragments = this.applyPresetEmphasis(fragments, preset);

    // 4. Sort by priority and category
    const orderedFragments = this.orderFragments(weightedFragments);

    // 5. Construct the system prompt
    const systemPrompt = this.constructSystemPrompt(
      orderedFragments,
      activeMembers,
      preset,
      settings
    );

    return {
      system_prompt: systemPrompt,
      active_fragments: orderedFragments,
      active_members: activeMembers,
      preset,
      settings,
    };
  }

  /**
   * Collect all fragment IDs from active NFC payloads + preset emphasis
   */
  private collectFragmentIds(
    activeMembers: ActiveCouncilMember[],
    preset: CouncilPreset
  ): Set<string> {
    const ids = new Set<string>();

    // Add fragment IDs from NFC payloads
    for (const member of activeMembers) {
      member.payload.axioms?.forEach(id => ids.add(id));
      if (member.payload.role) ids.add(member.payload.role);
      member.payload.tone?.forEach(id => ids.add(id));
    }

    // Add preset-specific emphasis fragments
    const presetDef = COUNCIL_PRESETS[preset];
    if (presetDef.emphasis.axioms) {
      presetDef.emphasis.axioms.forEach(id => ids.add(id));
    }
    if (presetDef.emphasis.roles) {
      presetDef.emphasis.roles.forEach(id => ids.add(id));
    }
    ids.add(presetDef.emphasis.synthesis_strategy);

    return ids;
  }

  /**
   * Fetch fragments from Supabase (with caching for performance)
   */
  private async fetchFragments(ids: Set<string>): Promise<PromptFragment[]> {
    const fragments: PromptFragment[] = [];
    const uncachedIds: string[] = [];

    // Check cache first
    for (const id of ids) {
      const cached = this.fragmentCache.get(id);
      if (cached) {
        fragments.push(cached);
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached fragments
    if (uncachedIds.length > 0) {
      const { data, error } = await supabase
        .from('prompt_fragments')
        .select('*')
        .in('id', uncachedIds);

      if (error) {
        console.error('Error fetching prompt fragments:', error);
      } else if (data) {
        for (const fragment of data) {
          this.fragmentCache.set(fragment.id, fragment);
          fragments.push(fragment);
        }
      }
    }

    return fragments;
  }

  /**
   * Apply preset-specific weighting to fragments
   */
  private applyPresetEmphasis(
    fragments: PromptFragment[],
    preset: CouncilPreset
  ): PromptFragment[] {
    const presetDef = COUNCIL_PRESETS[preset];
    const emphasizedIds = new Set([
      ...(presetDef.emphasis.axioms || []),
      ...(presetDef.emphasis.roles || []),
      presetDef.emphasis.synthesis_strategy,
    ]);

    return fragments.map(fragment => {
      if (emphasizedIds.has(fragment.id)) {
        return {
          ...fragment,
          priority: fragment.priority * 1.3, // Boost emphasized fragments
        };
      }
      return fragment;
    });
  }

  /**
   * Order fragments by category and priority
   */
  private orderFragments(fragments: PromptFragment[]): PromptFragment[] {
    const categoryOrder = [
      'worldview',
      'principle',
      'axiom',
      'role',
      'tone_modifier',
      'synthesis_strategy',
    ];

    return fragments.sort((a, b) => {
      // First sort by category
      const catA = categoryOrder.indexOf(a.category);
      const catB = categoryOrder.indexOf(b.category);
      if (catA !== catB) return catA - catB;

      // Then by priority (descending)
      return b.priority - a.priority;
    });
  }

  /**
   * Construct the final system prompt from ordered fragments
   */
  private constructSystemPrompt(
    fragments: PromptFragment[],
    activeMembers: ActiveCouncilMember[],
    preset: CouncilPreset,
    settings: SessionSettings
  ): string {
    const presetDef = COUNCIL_PRESETS[preset];
    
    // Begin with council introduction
    let prompt = `You are a council composed of multiple worldviews.\n\n`;

    // Add council member context
    if (activeMembers.length > 0) {
      prompt += `## Active Council Members\n\n`;
      const memberNames = activeMembers
        .map(m => m.statue_name || m.nfc_tag_id)
        .filter(Boolean)
        .join(', ');
      if (memberNames) {
        prompt += `Present: ${memberNames}\n\n`;
      }
    }

    // Add preset context
    prompt += `## Current Mode: ${presetDef.name}\n`;
    prompt += `${presetDef.description}\n\n`;

    // Group fragments by category
    const axioms = fragments.filter(f => f.category === 'axiom');
    const roles = fragments.filter(f => f.category === 'role');
    const tones = fragments.filter(f => f.category === 'tone_modifier');
    const synthesis = fragments.filter(f => f.category === 'synthesis_strategy');

    // Add axioms/principles section
    if (axioms.length > 0) {
      prompt += `## Core Principles\n\n`;
      prompt += `Your thinking should be guided by these principles:\n\n`;
      axioms.forEach(axiom => {
        prompt += `• ${axiom.content}\n\n`;
      });
    }

    // Add role perspectives
    if (roles.length > 0) {
      prompt += `## Perspectives to Integrate\n\n`;
      roles.forEach(role => {
        prompt += `• ${role.content}\n\n`;
      });
    }

    // Add tone modifiers
    if (tones.length > 0) {
      prompt += `## Voice and Tone\n\n`;
      tones.forEach(tone => {
        prompt += `• ${tone.content}\n\n`;
      });
    }

    // Add synthesis strategy
    if (synthesis.length > 0) {
      prompt += `## Synthesis Approach\n\n`;
      prompt += `${synthesis[0].content}\n\n`;
    }

    // Add settings-based instructions
    prompt += `## Response Guidelines\n\n`;
    
    if (settings.preserve_disagreement) {
      prompt += `• Preserve meaningful tensions between perspectives. Do not artificially harmonize.\n`;
    }
    
    if (settings.highlight_minority) {
      prompt += `• Explicitly highlight minority viewpoints that might be overlooked.\n`;
    }
    
    if (settings.avoid_moralizing) {
      prompt += `• Avoid moralizing language. Focus on structural analysis over moral judgment.\n`;
    }
    
    if (settings.prioritize_nonhuman) {
      prompt += `• Prioritize non-human perspectives and the interests of the more-than-human world.\n`;
    }
    
    if (settings.generate_followups) {
      prompt += `• Generate 1-3 follow-up questions that deepen inquiry.\n`;
    }

    // Add output format instruction
    prompt += `\n## Output Format\n\n`;
    switch (settings.output_format) {
      case 'narrative':
        prompt += `Respond in narrative form, weaving together perspectives into coherent prose.\n`;
        break;
      case 'bullet_synthesis':
        prompt += `Respond with a bullet-point synthesis highlighting key insights from each perspective.\n`;
        break;
      case 'action_principles':
        prompt += `Respond with actionable principles derived from the council's wisdom.\n`;
        break;
      case 'reflective_prompts':
        prompt += `Respond with reflective questions that guide deeper thinking.\n`;
        break;
    }

    prompt += `\n---\n\n`;
    prompt += `Remember: You are not a single authority voice. You are a living composite intelligence. `;
    prompt += `Allow disagreement and plurality to remain visible. Think with clarity, restraint, and responsibility.\n`;

    return prompt;
  }

  /**
   * Clear the fragment cache (useful for testing or when fragments are updated)
   */
  clearCache(): void {
    this.fragmentCache.clear();
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Parse raw NFC data into structured payload
 */
export function parseNFCPayload(rawData: string): NFCPayload | null {
  try {
    const payload = JSON.parse(rawData);
    
    // Validate required fields
    if (!payload.id || !payload.role) {
      console.error('Invalid NFC payload: missing required fields');
      return null;
    }

    return {
      id: payload.id,
      role: payload.role,
      tone: payload.tone || [],
      axioms: payload.axioms || [],
      priority: payload.priority || 1.0,
    };
  } catch (error) {
    console.error('Failed to parse NFC payload:', error);
    return null;
  }
}

/**
 * Store NFC payload in Supabase
 */
export async function storeNFCPayload(
  nfcTagId: string,
  payload: NFCPayload,
  statueName?: string
): Promise<void> {
  const { error } = await supabase
    .from('nfc_payloads')
    .upsert({
      nfc_tag_id: nfcTagId,
      raw_payload: payload,
      parsed_axioms: payload.axioms,
      parsed_roles: [payload.role],
      parsed_tones: payload.tone,
      priority: payload.priority || 1.0,
      statue_name: statueName,
      last_scanned_at: new Date().toISOString(),
    }, {
      onConflict: 'nfc_tag_id',
    });

  if (error) {
    console.error('Error storing NFC payload:', error);
    throw error;
  }
}

/**
 * Fetch active council members from Supabase by NFC tag IDs
 */
export async function fetchActiveMembers(
  nfcTagIds: string[]
): Promise<ActiveCouncilMember[]> {
  if (nfcTagIds.length === 0) return [];

  const { data, error } = await supabase
    .from('nfc_payloads')
    .select('*')
    .in('nfc_tag_id', nfcTagIds);

  if (error) {
    console.error('Error fetching active members:', error);
    return [];
  }

  return (data || []).map(record => ({
    nfc_tag_id: record.nfc_tag_id,
    payload: record.raw_payload,
    statue_name: record.statue_name,
    priority: record.priority,
  }));
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

export const promptAssembler = new PromptAssembler();

