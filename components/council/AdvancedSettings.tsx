/**
 * Advanced Settings Panel Component
 * 
 * Customization options for power users
 * Brand: Minimal, intentional, grounded
 */

'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import type { SessionSettings, OutputFormat } from '@/lib/types/council';

interface AdvancedSettingsProps {
  settings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
}

export function AdvancedSettings({ settings, onSettingsChange }: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (key: keyof SessionSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleOutputFormatChange = (format: OutputFormat) => {
    onSettingsChange({
      ...settings,
      output_format: format,
    });
  };

  return (
    <div className="bg-council-warmstone border border-council-softash/30 rounded-council overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-council-wood/5 transition-all duration-council"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-council-gold" />
          <span className="font-semibold text-council-charcoal">Advanced Settings</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-council-idle" />
        ) : (
          <ChevronDown className="w-5 h-5 text-council-idle" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-council-softash/20">
          {/* Response style toggles */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-council-charcoal">Response Style</h4>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.preserve_disagreement}
                onChange={() => handleToggle('preserve_disagreement')}
                className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
              />
              <div>
                <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                  Preserve Disagreement
                </div>
                <div className="text-xs text-council-idle">
                  Keep tensions visible
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.highlight_minority}
                onChange={() => handleToggle('highlight_minority')}
                className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
              />
              <div>
                <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                  Highlight Minority Views
                </div>
                <div className="text-xs text-council-idle">
                  Surface overlooked perspectives
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.avoid_moralizing}
                onChange={() => handleToggle('avoid_moralizing')}
                className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
              />
              <div>
                <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                  Avoid Moralizing
                </div>
                <div className="text-xs text-council-idle">
                  Focus on structural analysis
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.prioritize_nonhuman}
                onChange={() => handleToggle('prioritize_nonhuman')}
                className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
              />
              <div>
                <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                  Non-Human Perspectives
                </div>
                <div className="text-xs text-council-idle">
                  Center the more-than-human world
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.generate_followups}
                onChange={() => handleToggle('generate_followups')}
                className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
              />
              <div>
                <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                  Follow-up Questions
                </div>
                <div className="text-xs text-council-idle">
                  Include deepening questions
                </div>
              </div>
            </label>
          </div>

          {/* Output format */}
          <div className="space-y-3 pt-3 border-t border-council-softash/20">
            <h4 className="text-sm font-semibold text-council-charcoal">Output Format</h4>
            
            <div className="space-y-2">
              {[
                { value: 'narrative', label: 'Narrative', desc: 'Woven prose' },
                { value: 'bullet_synthesis', label: 'Bullet Points', desc: 'Key insights' },
                { value: 'action_principles', label: 'Action Principles', desc: 'Actionable wisdom' },
                { value: 'reflective_prompts', label: 'Questions', desc: 'Deeper thinking' },
              ].map((format) => (
                <label
                  key={format.value}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="output_format"
                    value={format.value}
                    checked={settings.output_format === format.value}
                    onChange={() => handleOutputFormatChange(format.value as OutputFormat)}
                    className="mt-1 w-4 h-4 accent-council-gold cursor-pointer"
                  />
                  <div>
                    <div className="text-council-charcoal group-hover:text-council-wood transition-colors">
                      {format.label}
                    </div>
                    <div className="text-xs text-council-idle">
                      {format.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

