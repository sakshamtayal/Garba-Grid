'use client';

import React from 'react';

/**
 * Royal Indian Festive Ornate Border Frame
 * Inspired by traditional Navratri/Dandiya & Royal Indian invitation borders.
 * Renders rich gold/marigold dual-line frames, repeating floral-jaali edge vines,
 * and elaborate corner lotus-mandala filigree.
 */
export default function WebsiteOrnateFrame() {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none z-40 select-none overflow-hidden"
    >
      {/* ── Outer Golden Border Box ── */}
      <div className="absolute inset-1.5 sm:inset-3 rounded-2xl border-[1.5px] border-[#D4AF37]/70 shadow-[0_0_12px_rgba(212,175,55,0.35)] pointer-events-none" />
      
      {/* ── Inner Thin Marigold Accent Border ── */}
      <div className="absolute inset-2.5 sm:inset-4 rounded-[12px] border border-[#FF8C00]/40 pointer-events-none" />

      {/* ── TOP BORDER VINE ── */}
      <div className="absolute top-1.5 sm:top-3 left-20 sm:left-28 right-20 sm:right-28 h-4 overflow-hidden flex items-center justify-center opacity-90">
        <svg className="w-full h-4" preserveAspectRatio="repeat" viewBox="0 0 400 16" fill="none">
          <defs>
            <pattern id="royal-top-vine" width="80" height="16" patternUnits="userSpaceOnUse">
              {/* Central golden bead & flower */}
              <circle cx="40" cy="8" r="3" fill="#D4AF37" />
              <circle cx="40" cy="8" r="1.5" fill="#FF8C00" />
              
              {/* Petals / Vine swirls */}
              <path d="M40 8 C30 2, 20 14, 10 8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M40 8 C50 2, 60 14, 70 8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              
              {/* Little floral buds */}
              <circle cx="20" cy="4" r="1.5" fill="#E91E8C" />
              <circle cx="60" cy="4" r="1.5" fill="#E91E8C" />
              <circle cx="10" cy="8" r="2" fill="#D4AF37" />
              <circle cx="70" cy="8" r="2" fill="#D4AF37" />
              <circle cx="80" cy="8" r="2.5" fill="#FF8C00" />
              
              {/* Connecting baseline */}
              <line x1="0" y1="8" x2="80" y2="8" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" strokeDasharray="4 2" />
            </pattern>
          </defs>
          <rect width="100%" height="16" fill="url(#royal-top-vine)" />
        </svg>
      </div>

      {/* ── BOTTOM BORDER VINE ── */}
      <div className="absolute bottom-1.5 sm:bottom-3 left-20 sm:left-28 right-20 sm:right-28 h-4 overflow-hidden flex items-center justify-center opacity-90">
        <svg className="w-full h-4" preserveAspectRatio="repeat" viewBox="0 0 400 16" fill="none">
          <defs>
            <pattern id="royal-bot-vine" width="80" height="16" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="8" r="3" fill="#D4AF37" />
              <circle cx="40" cy="8" r="1.5" fill="#FF8C00" />
              <path d="M40 8 C30 14, 20 2, 10 8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M40 8 C50 14, 60 2, 70 8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <circle cx="20" cy="12" r="1.5" fill="#E91E8C" />
              <circle cx="60" cy="12" r="1.5" fill="#E91E8C" />
              <circle cx="10" cy="8" r="2" fill="#D4AF37" />
              <circle cx="70" cy="8" r="2" fill="#D4AF37" />
              <circle cx="80" cy="8" r="2.5" fill="#FF8C00" />
              <line x1="0" y1="8" x2="80" y2="8" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" strokeDasharray="4 2" />
            </pattern>
          </defs>
          <rect width="100%" height="16" fill="url(#royal-bot-vine)" />
        </svg>
      </div>

      {/* ── LEFT BORDER VINE ── */}
      <div className="absolute top-20 sm:top-28 bottom-20 sm:bottom-28 left-1.5 sm:left-3 w-4 overflow-hidden flex items-center justify-center opacity-90">
        <svg className="w-4 h-full" preserveAspectRatio="repeat" viewBox="0 0 16 400" fill="none">
          <defs>
            <pattern id="royal-left-vine" width="16" height="80" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="40" r="3" fill="#D4AF37" />
              <circle cx="8" cy="40" r="1.5" fill="#FF8C00" />
              <path d="M8 40 C2 30, 14 20, 8 10" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M8 40 C2 50, 14 60, 8 70" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <circle cx="4" cy="20" r="1.5" fill="#E91E8C" />
              <circle cx="4" cy="60" r="1.5" fill="#E91E8C" />
              <circle cx="8" cy="10" r="2" fill="#D4AF37" />
              <circle cx="8" cy="70" r="2" fill="#D4AF37" />
              <circle cx="8" cy="80" r="2.5" fill="#FF8C00" />
              <line x1="8" y1="0" x2="8" y2="80" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" strokeDasharray="4 2" />
            </pattern>
          </defs>
          <rect width="16" height="100%" fill="url(#royal-left-vine)" />
        </svg>
      </div>

      {/* ── RIGHT BORDER VINE ── */}
      <div className="absolute top-20 sm:top-28 bottom-20 sm:bottom-28 right-1.5 sm:right-3 w-4 overflow-hidden flex items-center justify-center opacity-90">
        <svg className="w-4 h-full" preserveAspectRatio="repeat" viewBox="0 0 16 400" fill="none">
          <defs>
            <pattern id="royal-right-vine" width="16" height="80" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="40" r="3" fill="#D4AF37" />
              <circle cx="8" cy="40" r="1.5" fill="#FF8C00" />
              <path d="M8 40 C14 30, 2 20, 8 10" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M8 40 C14 50, 2 60, 8 70" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <circle cx="12" cy="20" r="1.5" fill="#E91E8C" />
              <circle cx="12" cy="60" r="1.5" fill="#E91E8C" />
              <circle cx="8" cy="10" r="2" fill="#D4AF37" />
              <circle cx="8" cy="70" r="2" fill="#D4AF37" />
              <circle cx="8" cy="80" r="2.5" fill="#FF8C00" />
              <line x1="8" y1="0" x2="8" y2="80" stroke="#D4AF37" strokeWidth="0.8" opacity="0.6" strokeDasharray="4 2" />
            </pattern>
          </defs>
          <rect width="16" height="100%" fill="url(#royal-right-vine)" />
        </svg>
      </div>

      {/* ── 4 ELABORATE CORNER MOTIFS ── */}
      {/* Top Left */}
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
        <IndianCornerFiligree />
      </div>
      
      {/* Top Right */}
      <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
        <IndianCornerFiligree className="scale-x-[-1]" />
      </div>
      
      {/* Bottom Left */}
      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2">
        <IndianCornerFiligree className="scale-y-[-1]" />
      </div>
      
      {/* Bottom Right */}
      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
        <IndianCornerFiligree className="scale-[-1]" />
      </div>
    </div>
  );
}

/**
 * Traditional Indian Royal Corner Filigree with Paisley & Lotus motifs
 */
function IndianCornerFiligree({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-16 h-16 sm:w-24 sm:h-24 drop-shadow-[0_0_10px_rgba(212,175,55,0.55)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer corner L-frames */}
      <path
        d="M4 96V16C4 9.37 9.37 4 16 4H96"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 92V20C9 13.92 13.92 9 20 9H92"
        stroke="#FF8C00"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M14 86V24C14 18.48 18.48 14 24 14H86"
        stroke="#E91E8C"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />

      {/* Corner Paisley & Lotus Petal Layer */}
      <path
        d="M4 4 Q 28 8 36 36 Q 8 28 4 4 Z"
        fill="url(#goldPaisleyGrad)"
        stroke="#D4AF37"
        strokeWidth="1"
      />
      
      <path
        d="M4 4 Q 42 12 50 50 Q 12 42 4 4 Z"
        fill="url(#raniPinkGrad)"
        opacity="0.35"
      />

      {/* Decorative filigree curls */}
      <path
        d="M18 4 C 18 16, 32 26, 44 26 C 34 26, 26 34, 26 44"
        stroke="#FFD700"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      <path
        d="M60 4 C 60 14, 70 20, 80 20"
        stroke="#D4AF37"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="80" cy="20" r="2.5" fill="#FF8C00" stroke="#FFE57F" strokeWidth="0.5" />

      <path
        d="M4 60 C 14 60, 20 70, 20 80"
        stroke="#D4AF37"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="80" r="2.5" fill="#FF8C00" stroke="#FFE57F" strokeWidth="0.5" />

      {/* Ornamental Jewels & Kundan Beads */}
      <circle cx="4" cy="4" r="3.5" fill="#D4AF37" />
      <circle cx="22" cy="22" r="3.5" fill="#FF8C00" stroke="#FFF" strokeWidth="0.75" />
      <circle cx="36" cy="36" r="4.5" fill="#E91E8C" stroke="#FFD700" strokeWidth="1" />
      <circle cx="50" cy="50" r="3" fill="#D4AF37" />
      <circle cx="44" cy="26" r="2" fill="#FF8C00" />
      <circle cx="26" cy="44" r="2" fill="#FF8C00" />

      {/* Radiant Petal Rays */}
      <line x1="4" y1="4" x2="16" y2="16" stroke="#FFF2A3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="4" x2="26" y2="10" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
      <line x1="4" y1="4" x2="10" y2="26" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />

      {/* Gradients */}
      <defs>
        <linearGradient id="goldPaisleyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
        <linearGradient id="raniPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="50%" stopColor="#E91E8C" />
          <stop offset="100%" stopColor="#7B1FA2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
