'use client';

import React from 'react';

interface OrnateDividerProps {
  className?: string;
  variant?: 'simple' | 'elaborate' | 'lotus';
}

export default function OrnateDivider({ className = '', variant = 'elaborate' }: OrnateDividerProps) {
  if (variant === 'simple') {
    return (
      <div className={`flex items-center justify-center gap-3 my-6 opacity-80 ${className}`}>
        <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
        <div className="w-2 h-2 rotate-45 bg-[#FF8C00] shadow-[0_0_6px_#FF8C00]" />
        <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2 my-8 select-none ${className}`}>
      {/* Left decorative line */}
      <div className="h-[1.5px] flex-1 max-w-[160px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#FF8C00]" />
      
      {/* Lotus / Floral Centerpiece */}
      <div className="flex items-center gap-1.5 px-3">
        <svg viewBox="0 0 120 28" className="w-28 sm:w-36 h-7 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" fill="none">
          {/* Central Lotus Motif */}
          <path d="M60 4 C54 14, 52 22, 60 26 C68 22, 66 14, 60 4 Z" fill="#FF8C00" />
          <path d="M60 10 C50 14, 42 22, 52 25 C56 22, 58 16, 60 10 Z" fill="#D4AF37" opacity="0.85" />
          <path d="M60 10 C70 14, 78 22, 68 25 C64 22, 62 16, 60 10 Z" fill="#D4AF37" opacity="0.85" />
          <path d="M60 16 C46 18, 36 24, 44 26 C50 24, 56 20, 60 16 Z" fill="#E91E8C" opacity="0.9" />
          <path d="M60 16 C74 18, 84 24, 76 26 C70 24, 64 20, 60 16 Z" fill="#E91E8C" opacity="0.9" />
          
          {/* Swirls extending out */}
          <path d="M36 24 C24 24, 16 18, 6 18" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M84 24 C96 24, 104 18, 114 18" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
          
          {/* Accent dots / jewels */}
          <circle cx="6" cy="18" r="2" fill="#FF8C00" />
          <circle cx="114" cy="18" r="2" fill="#FF8C00" />
          <circle cx="60" cy="25" r="2" fill="#FFF2A3" />
        </svg>
      </div>

      {/* Right decorative line */}
      <div className="h-[1.5px] flex-1 max-w-[160px] bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#FF8C00]" />
    </div>
  );
}
