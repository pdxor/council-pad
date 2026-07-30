/**
 * CouncilPAD v1.1 - Main Application Page
 * 
 * "Where wisdom becomes present"
 */

'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CouncilTable } from '@/components/council/CouncilTable';
import { NFCScanner } from '@/components/council/NFCScanner';
import { QuestionLibrary } from '@/components/council/QuestionLibrary';
import { CouncilPresets } from '@/components/council/CouncilPresets';
import { AdvancedSettings } from '@/components/council/AdvancedSettings';
import type { 
  ActiveCouncilMember, 
  CouncilPreset, 
  SessionSettings,
  CouncilResponse 
} from '@/lib/types/council';
import type { NFCScanResult } from '@/lib/engines/nfc-reader';

export default function CouncilPage() {
  // State
  const [activeMembers, setActiveMembers] = useState<ActiveCouncilMember[]>([]);
  const [question, setQuestion] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<CouncilPreset>('integrative_wisdom');
  const [settings, setSettings] = useState<SessionSettings>({
    preserve_disagreement: true,
    highlight_minority: false,
    avoid_moralizing: false,
    prioritize_nonhuman: false,
    generate_followups: true,
    output_format: 'narrative',
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [response, setResponse] = useState<CouncilResponse | null>(null);
  const [showQuestionLibrary, setShowQuestionLibrary] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: selectedPreset,
          settings,
          active_nfc_tags: activeMembers.map(m => m.nfc_tag_id),
        }),
      });
      const data = await res.json();
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleNFCScan = (result: NFCScanResult) => {
    if (result.success && result.payload && result.nfcTagId) {
      // Check if already active
      const exists = activeMembers.find(m => m.nfc_tag_id === result.nfcTagId);
      if (exists) {
        alert('This member is already present');
        return;
      }

      // Add to active members with proper name
      const newMember: ActiveCouncilMember = {
        nfc_tag_id: result.nfcTagId,
        statue_name: result.statueName || result.payload.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        payload: result.payload,
        priority: result.payload.priority || 1.0,
      };

      setActiveMembers([...activeMembers, newMember]);
      
      // Update session
      if (sessionId) {
        updateSession([...activeMembers, newMember]);
      }
    }
  };

  const updateSession = async (members: ActiveCouncilMember[]) => {
    if (!sessionId) return;

    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          preset: selectedPreset,
          settings,
          active_nfc_tags: members.map(m => m.nfc_tag_id),
        }),
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleAskCouncil = async () => {
    if (!question.trim() || activeMembers.length === 0) {
      alert('Please add council members and enter a question');
      return;
    }

    setIsQuerying(true);
    setResponse(null);

    try {
      const res = await fetch('/api/council/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          session_id: sessionId,
          active_nfc_tags: activeMembers.map(m => m.nfc_tag_id),
          preset: selectedPreset,
          settings,
          use_mock: false, // Use real OpenAI!
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error querying council:', error);
      alert('Failed to query council');
    } finally {
      setIsQuerying(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      updateSession(activeMembers);
    }
  }, [selectedPreset, settings]);

  return (
    <div className="min-h-screen bg-council-wood">
      {/* Header */}
      <header className="border-b border-futurist-gold/20 bg-futurist-teal/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo variant="full" size="md" />
            <p className="text-sm text-futurist-muted italic">
              Where wisdom becomes present
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Council & Scanner */}
          <div className="lg:col-span-2 space-y-8">
            {/* Council Table */}
            <section className="bg-futurist-teal border border-futurist-muted/30 rounded-council p-8">
              <h2 className="text-xl font-semibold text-futurist-cream mb-6 text-center">
                Active Council
              </h2>
              <CouncilTable 
                activeMembers={activeMembers}
                maxSeats={8}
              />
            </section>

            {/* NFC Scanner */}
            <section>
              <NFCScanner 
                onScanComplete={handleNFCScan}
                isDevelopment={true}
              />
            </section>

            {/* Question Input */}
            <section className="bg-futurist-teal border border-futurist-muted/30 rounded-council p-6">
              <h2 className="text-xl font-semibold text-futurist-cream mb-4">
                Ask the Council
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionLibrary(!showQuestionLibrary)}
                    className="px-6 py-3 border-2 border-futurist-gold rounded-council font-semibold uppercase tracking-wider text-sm transition-all duration-council bg-transparent text-futurist-gold hover:bg-futurist-gold hover:text-futurist-navy"
                  >
                    {showQuestionLibrary ? 'HIDE LIBRARY' : 'QUESTION LIBRARY'}
                  </button>
                </div>

                {showQuestionLibrary && (
                  <div className="bg-futurist-navy/50 rounded-council p-4 border border-futurist-muted/20">
                    <QuestionLibrary 
                      onSelectQuestion={(q) => {
                        setQuestion(q);
                        setShowQuestionLibrary(false);
                      }}
                    />
                  </div>
                )}

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What question brings you to the council?"
                  rows={4}
                  className="w-full bg-futurist-navy border border-futurist-muted/40 rounded-council px-4 py-3 text-futurist-cream placeholder-futurist-muted resize-none focus:outline-none focus:border-futurist-gold transition-all duration-council"
                />

                <button
                  onClick={handleAskCouncil}
                  disabled={isQuerying || activeMembers.length === 0 || !question.trim()}
                  className="w-full py-4 border-2 border-futurist-gold rounded-council font-semibold uppercase tracking-wider text-sm transition-all duration-council bg-futurist-gold text-futurist-navy hover:bg-futurist-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isQuerying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        CONSULTING...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        ASK THE COUNCIL
                      </>
                    )}
                  </div>
                </button>
              </div>
            </section>

            {/* Response */}
            {response && (
              <section className="bg-futurist-teal border-2 border-futurist-gold/60 rounded-council p-6">
                <h2 className="text-xl font-semibold text-futurist-cream mb-4">
                  Council Response
                </h2>
                
                <div className="prose prose-council max-w-none">
                  <div className="text-futurist-cream whitespace-pre-wrap leading-relaxed">
                    {response.response_text}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-futurist-muted/30 text-xs text-futurist-muted">
                  <div className="flex justify-between">
                    <span>Tokens: {response.tokens_used}</span>
                    <span>Fragments: {response.active_fragments.length}</span>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            {/* Presets */}
            <section className="bg-futurist-teal border border-futurist-muted/30 rounded-council p-6">
              <CouncilPresets
                selectedPreset={selectedPreset}
                onSelectPreset={setSelectedPreset}
              />
            </section>

            {/* Advanced Settings */}
            <section>
              <AdvancedSettings
                settings={settings}
                onSettingsChange={setSettings}
              />
            </section>

            {/* Info Panel */}
            <section className="bg-futurist-teal border border-futurist-muted/30 rounded-council p-6">
              <h3 className="text-lg font-semibold text-futurist-cream mb-3">
                How It Works
              </h3>
              <div className="space-y-2 text-sm text-futurist-muted">
                <p>
                  <strong className="text-futurist-cream">Add statues</strong> to form the council
                </p>
                <p>
                  <strong className="text-futurist-cream">Choose a lens</strong> to emphasize perspectives
                </p>
                <p>
                  <strong className="text-futurist-cream">Ask your question</strong> and receive wisdom
                </p>
                <p className="pt-3 text-xs italic text-futurist-muted-dark border-t border-futurist-muted/20 mt-3">
                  Presence shapes perspective. Who is at the table matters.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

