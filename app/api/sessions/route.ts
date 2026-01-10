/**
 * API Route: POST /api/sessions
 * 
 * Create or update a council session
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CouncilPreset, SessionSettings } from '@/lib/types/council';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      session_id,
      user_id,
      preset = 'integrative_wisdom' as CouncilPreset,
      settings = {
        preserve_disagreement: true,
        highlight_minority: false,
        avoid_moralizing: false,
        prioritize_nonhuman: false,
        generate_followups: true,
        output_format: 'narrative',
      } as SessionSettings,
      active_nfc_tags = [],
    } = body;

    // Update existing session
    if (session_id) {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          preset,
          settings,
          active_nfc_tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    // Create new session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user_id || null,
        preset,
        settings,
        active_nfc_tags,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error managing session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const user_id = searchParams.get('user_id');

    if (session_id) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }

    if (user_id) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'session_id or user_id required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

