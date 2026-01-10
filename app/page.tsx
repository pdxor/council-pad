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
      <header className="border-b border-council-gold/20 bg-council-warmstone/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo variant="full" size="md" />
            <p className="text-sm text-council-softash italic">
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
            <section className="bg-council-warmstone border border-council-softash/30 rounded-council p-8">
              <h2 className="text-xl font-semibold text-council-charcoal mb-6 text-center">
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
            <section className="bg-council-warmstone border border-council-softash/30 rounded-council p-6">
              <h2 className="text-xl font-semibold text-council-charcoal mb-4">
                Ask the Council
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionLibrary(!showQuestionLibrary)}
                    className="px-4 py-2 bg-council-wood/10 hover:bg-council-wood/20 border border-council-softash/40 rounded-council transition-all duration-council text-sm text-council-charcoal font-medium"
                  >
                    {showQuestionLibrary ? 'Hide' : 'Show'} Question Library
                  </button>
                </div>

                {showQuestionLibrary && (
                  <div className="bg-council-wood/5 rounded-council p-4 border border-council-softash/20">
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
                  className="w-full bg-white border border-council-softash/40 rounded-council px-4 py-3 text-council-charcoal placeholder-council-idle resize-none focus:outline-none focus:border-council-gold transition-all duration-council"
                />

                <button
                  onClick={handleAskCouncil}
                  disabled={isQuerying || activeMembers.length === 0 || !question.trim()}
                  className="w-full bg-council-gold text-council-charcoal font-semibold py-3 rounded-council hover:bg-council-gold/90 transition-all duration-council disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isQuerying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Consulting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Ask the Council
                      </>
                    )}
                  </div>
                </button>
              </div>
            </section>

            {/* Response */}
            {response && (
              <section className="bg-council-warmstone border-2 border-council-gold/60 rounded-council p-6">
                <h2 className="text-xl font-semibold text-council-charcoal mb-4">
                  Council Response
                </h2>
                
                <div className="prose prose-council max-w-none">
                  <div className="text-council-charcoal whitespace-pre-wrap leading-relaxed">
                    {response.response_text}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-council-softash/30 text-xs text-council-idle">
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
            <section className="bg-council-warmstone border border-council-softash/30 rounded-council p-6">
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
            <section className="bg-council-warmstone border border-council-softash/30 rounded-council p-6">
              <h3 className="text-lg font-semibold text-council-charcoal mb-3">
                How It Works
              </h3>
              <div className="space-y-2 text-sm text-council-idle">
                <p>
                  <strong className="text-council-charcoal">Add statues</strong> to form the council
                </p>
                <p>
                  <strong className="text-council-charcoal">Choose a lens</strong> to emphasize perspectives
                </p>
                <p>
                  <strong className="text-council-charcoal">Ask your question</strong> and receive wisdom
                </p>
                <p className="pt-3 text-xs italic text-council-softash border-t border-council-softash/20 mt-3">
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

