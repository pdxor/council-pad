/**
 * Council Presets Component
 * 
 * Preset selector for different council lenses
 * Brand: Flat, modular, calm authority
 */

'use client';

import type { CouncilPreset } from '@/lib/types/council';
import { COUNCIL_PRESETS } from '@/lib/types/council';

interface CouncilPresetsProps {
  selectedPreset: CouncilPreset;
  onSelectPreset: (preset: CouncilPreset) => void;
}

export function CouncilPresets({ selectedPreset, onSelectPreset }: CouncilPresetsProps) {
  const presets = Object.values(COUNCIL_PRESETS).filter(p => p.id !== 'custom');

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-futurist-cream uppercase tracking-wide">
        Council Lens
      </h3>
      <p className="text-sm text-futurist-muted">
        Choose a perspective to emphasize
      </p>

      <div className="grid grid-cols-1 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className={`
              text-left p-4 rounded-council border-2 transition-all duration-council
              ${selectedPreset === preset.id
                ? 'bg-futurist-gold/20 border-futurist-gold'
                : 'bg-futurist-navy border-futurist-muted/40 hover:border-futurist-gold/60'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{preset.icon}</span>
              <div className="flex-1">
                <h4 className={`font-semibold uppercase tracking-wide ${
                  selectedPreset === preset.id ? 'text-futurist-gold' : 'text-futurist-cream'
                }`}>
                  {preset.name}
                </h4>
                <p className="text-sm text-futurist-muted mt-1">
                  {preset.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

