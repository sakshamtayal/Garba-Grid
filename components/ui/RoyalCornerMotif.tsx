'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RoyalCornerMotifProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'festival';
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

/**
 * Traditional Indian ornate floral filigree corner motif inspired by royal Navratri invitations & jaali art.
 */
export function RoyalCornerMotif({
  className,
  size = 'md',
  variant = 'gold',
}: RoyalCornerMotifProps) {
  const strokeColor = variant === 'gold' ? '#D4AF37' : '#FF8C00';
  const accentColor = variant === 'gold' ? '#F0CE5E' : '#E91E8C';

  const CornerSVG = ({ rotation = '' }: { rotation?: string }) => (
    <svg
      viewBox="0 0 40 40"
      className={cn(sizeMap[size], 'pointer-events-none select-none drop-shadow-sm', rotation)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer corner frame lines */}
      <path
        d="M2 38V6C2 3.79086 3.79086 2 6 2H38"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 34V10C6 7.79086 7.79086 6 10 6H34"
        stroke={accentColor}
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />

      {/* Ornate Lotus / Petal Filigree */}
      <path
        d="M2 2C8 6 14 12 18 18C12 14 6 8 2 2Z"
        fill={strokeColor}
        opacity="0.7"
      />
      <circle cx="18" cy="18" r="2.5" fill={accentColor} />
      <circle cx="2" cy="2" r="2" fill={strokeColor} />
      
      {/* Delicate floral scroll */}
      <path
        d="M10 2C10 6 14 10 18 10C14 10 10 14 10 18"
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="1.5" fill={strokeColor} />
      <circle cx="28" cy="2" r="1.5" fill={accentColor} />
      <circle cx="2" cy="28" r="1.5" fill={accentColor} />
    </svg>
  );

  return (
    <div className={cn('absolute inset-0 pointer-events-none p-1.5 z-10', className)}>
      <div className="absolute top-1 left-1">
        <CornerSVG />
      </div>
      <div className="absolute top-1 right-1">
        <CornerSVG rotation="scale-x-[-1]" />
      </div>
      <div className="absolute bottom-1 left-1">
        <CornerSVG rotation="scale-y-[-1]" />
      </div>
      <div className="absolute bottom-1 right-1">
        <CornerSVG rotation="scale-[-1]" />
      </div>
    </div>
  );
}

export default RoyalCornerMotif;
