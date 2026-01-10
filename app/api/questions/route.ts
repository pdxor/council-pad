/**
 * API Route: GET /api/questions
 * 
 * Fetch questions from the universal question library
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { QuestionCategory } from '@/lib/types/council';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as QuestionCategory | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('questions')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question_id } = body;

    if (!question_id) {
      return NextResponse.json(
        { error: 'question_id required' },
        { status: 400 }
      );
    }

    // Increment usage count
    // First try to use RPC if it exists
    const { error: rpcError } = await supabase.rpc('increment_question_usage', {
      question_id,
    });

    if (rpcError) {
      // If RPC doesn't exist, fetch current count and increment
      const { data: question } = await supabase
        .from('questions')
        .select('usage_count')
        .eq('id', question_id)
        .single();
      
      if (question) {
        await supabase
          .from('questions')
          .update({
            usage_count: question.usage_count + 1,
          })
          .eq('id', question_id);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating question usage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

