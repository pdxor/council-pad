/**
 * Council Table Component
 * 
 * Visual grid showing active council members
 * Brand: Flat, minimal, warm, calm authority
 */

'use client';

import { useState } from 'react';
import type { ActiveCouncilMember } from '@/lib/types/council';

interface CouncilSeat {
  position: number;
  member?: ActiveCouncilMember;
}

interface CouncilTableProps {
  activeMembers: ActiveCouncilMember[];
  maxSeats?: number;
  onSeatClick?: (seat: CouncilSeat) => void;
}

export function CouncilTable({ 
  activeMembers, 
  maxSeats = 8,
  onSeatClick 
}: CouncilTableProps) {
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  // Create seats array with members
  const seats: CouncilSeat[] = Array.from({ length: maxSeats }, (_, i) => ({
    position: i,
    member: activeMembers[i],
  }));

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Council Circle */}
      <div className="relative aspect-square w-full">
        {/* Center circle decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-1/3 h-1/3 rounded-full border border-council-gold/30" />
        </div>

        {/* Council seats arranged in circle */}
        {seats.map((seat, index) => {
          const angle = (index / maxSeats) * 2 * Math.PI - Math.PI / 2;
          const radius = 42; // percentage
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          const isActive = !!seat.member;
          const isHovered = hoveredSeat === index;

          return (
            <div
              key={seat.position}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-council"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              onMouseEnter={() => setHoveredSeat(index)}
              onMouseLeave={() => setHoveredSeat(null)}
              onClick={() => onSeatClick?.(seat)}
            >
              {/* Seat visualization - flat, rounded square */}
              <div
                className={`
                  relative cursor-pointer transition-all duration-council
                  ${isActive ? 'scale-110' : 'scale-100'}
                  ${isHovered ? 'scale-125' : ''}
                `}
              >
                <div
                  className={`
                    w-14 h-14 rounded-council border-2 flex items-center justify-center
                    ${isActive 
                      ? 'bg-council-gold border-council-gold' 
                      : 'bg-council-wood border-council-idle'
                    }
                    transition-all duration-council
                  `}
                >
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-council-wood" />
                  )}
                </div>

                {/* Member name tooltip */}
                {isActive && isHovered && (
                  <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-council-warmstone border border-council-gold rounded-council px-4 py-3 shadow-lg min-w-[200px]">
                      <h3 className="text-council-charcoal font-semibold text-sm">
                        {seat.member?.statue_name || seat.member?.nfc_tag_id}
                      </h3>
                      <p className="text-council-idle text-xs mt-1">
                        {seat.member?.payload.role.replace(/_/g, ' ')}
                      </p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {seat.member?.payload.axioms.slice(0, 3).map(axiom => (
                          <span
                            key={axiom}
                            className="text-[10px] bg-council-wood/10 px-2 py-0.5 rounded text-council-wood"
                          >
                            {axiom.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active member count */}
      <div className="text-center mt-8">
        <p className="text-council-idle text-sm font-medium">
          {activeMembers.length} of {maxSeats} present
        </p>
      </div>
    </div>
  );
}

