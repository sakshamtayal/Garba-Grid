'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const stickSize: Record<LoaderSize, { width: number; height: number; gap: number }> = {
  sm: { width: 4,  height: 18, gap: 3 },
  md: { width: 5,  height: 26, gap: 4 },
  lg: { width: 7,  height: 36, gap: 6 },
};

const flameSize: Record<LoaderSize, { viewBox: string; containerClass: string }> = {
  sm: { viewBox: '0 0 20 28', containerClass: 'w-5 h-7' },
  md: { viewBox: '0 0 28 40', containerClass: 'w-7 h-10' },
  lg: { viewBox: '0 0 40 56', containerClass: 'w-10 h-14' },
};

// ─── DandiayaLoader ───────────────────────────────────────────────────────────

/**
 * Two stylized dandiya sticks that click/cross each other rhythmically.
 */
export function DandiayaLoader({ size = 'md', className }: LoaderProps) {
  const dims = stickSize[size];

  const stickVariants = {
    initial: { rotate: -30 },
    animate: {
      rotate: [-30, 30, -30],
      transition: {
        duration: 0.7,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  const stickVariantsRight = {
    initial: { rotate: 30 },
    animate: {
      rotate: [30, -30, 30],
      transition: {
        duration: 0.7,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  };

  return (
    <div
      className={cn('inline-flex items-end justify-center', className)}
      style={{ gap: dims.gap, height: dims.height + 4 }}
      aria-label="Loading..."
      role="status"
    >
      {/* Left stick */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stickVariants}
        className="rounded-full"
        style={{
          width: dims.width,
          height: dims.height,
          background: 'linear-gradient(135deg, #FF8C00 0%, #D4AF37 100%)',
          borderRadius: 9999,
          transformOrigin: 'bottom center',
        }}
      />

      {/* Right stick */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={stickVariantsRight}
        style={{
          width: dims.width,
          height: dims.height,
          background: 'linear-gradient(135deg, #E91E8C 0%, #FF8C00 100%)',
          borderRadius: 9999,
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}

// ─── DiyaLoader ──────────────────────────────────────────────────────────────

/**
 * A stylised diya (oil lamp) with a pulsing flame.
 */
export function DiyaLoader({ size = 'md', className }: LoaderProps) {
  const dims = flameSize[size];

  return (
    <div
      className={cn('inline-flex flex-col items-center', className)}
      aria-label="Loading..."
      role="status"
    >
      {/* Flame */}
      <motion.svg
        viewBox={dims.viewBox}
        className={cn(dims.containerClass, 'drop-shadow-[0_0_8px_rgba(255,140,0,0.8)]')}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1.4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        {/* Outer flame */}
        <path
          d="M14 2C14 2 20 8 20 15C20 20.5 17.5 24 14 26C10.5 24 8 20.5 8 15C8 8 14 2 14 2Z"
          fill="url(#flameGrad)"
          opacity="0.9"
        />
        {/* Inner bright core */}
        <path
          d="M14 10C14 10 17 13.5 17 17C17 19.5 15.8 21 14 22C12.2 21 11 19.5 11 17C11 13.5 14 10 14 10Z"
          fill="#FFF3A3"
          opacity="0.95"
        />
        {/* Defs */}
        <defs>
          <linearGradient id="flameGrad" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3A3" />
            <stop offset="40%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#E91E8C" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Diya bowl */}
      <svg
        viewBox="0 0 32 10"
        className={cn(
          size === 'sm' ? 'w-8 h-2.5' : size === 'md' ? 'w-10 h-3' : 'w-14 h-4',
          '-mt-1'
        )}
      >
        <ellipse cx="16" cy="5" rx="15" ry="4.5" fill="#D4AF37" opacity="0.9" />
        <ellipse cx="16" cy="3.5" rx="13" ry="3" fill="#A88A1C" />
      </svg>
    </div>
  );
}

// ─── Full-screen loading overlay ──────────────────────────────────────────────

export function LoadingOverlay({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-sm gap-4">
      <DiyaLoader size="lg" />
      <p className="text-text-secondary text-sm animate-pulse">{message}</p>
    </div>
  );
}

export default DandiayaLoader;

