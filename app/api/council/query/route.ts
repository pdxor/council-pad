/**
 * API Route: POST /api/council/query
 * 
 * Main endpoint for querying the council with a question
 */

import { NextRequest, NextResponse } from 'next/server';
import { promptAssembler, fetchActiveMembers } from '@/lib/engines/prompt-assembler';
import { queryCouncil, mockCouncilQuery } from '@/lib/engines/openai-client';
import { supabase } from '@/lib/supabase';
import type { CouncilPreset, SessionSettings } from '@/lib/types/council';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      question,
      session_id,
      active_nfc_tags = [],
      preset = 'integrative_wisdom' as CouncilPreset,
      settings = {
        preserve_disagreement: true,
        highlight_minority: false,
        avoid_moralizing: false,
        prioritize_nonhuman: false,
        generate_followups: true,
        output_format: 'narrative',
      } as SessionSettings,
      use_mock = process.env.NODE_ENV === 'development',
    } = body;

    // Validation
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(active_nfc_tags) || active_nfc_tags.length === 0) {
      return NextResponse.json(
        { error: 'At least one NFC tag must be active' },
        { status: 400 }
      );
    }

    // 1. Fetch active council members
    const activeMembers = await fetchActiveMembers(active_nfc_tags);

    if (activeMembers.length === 0) {
      return NextResponse.json(
        { error: 'No active members found for provided NFC tags' },
        { status: 404 }
      );
    }

    // 2. Assemble prompt
    const assembledPrompt = await promptAssembler.assemblePrompt(
      activeMembers,
      preset,
      settings
    );

    // 3. Query OpenAI (or use mock)
    const { response, tokens_used } = use_mock
      ? await mockCouncilQuery(question, assembledPrompt)
      : await queryCouncil(question, assembledPrompt);

    // 4. Store response in database
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .insert({
        session_id: session_id || null,
        question_text: question,
        assembled_prompt: assembledPrompt.system_prompt,
        response_text: response,
        active_fragments: assembledPrompt.active_fragments.map(f => f.id),
        preset_used: preset,
        tokens_used,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error storing response:', responseError);
    }

    // 5. Return response
    return NextResponse.json({
      response_text: response,
      assembled_prompt: assembledPrompt.system_prompt,
      active_fragments: assembledPrompt.active_fragments.map(f => f.id),
      tokens_used,
      session_id: session_id || null,
      response_id: responseData?.id,
    });

  } catch (error) {
    console.error('Error in council query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

