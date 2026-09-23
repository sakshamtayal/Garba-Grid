'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Auth Layout ──────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-bg-primary overflow-hidden flex items-center justify-center p-4">
      {/* ── Mesh Background ── */}
      <div className="absolute inset-0 bg-mesh-bg pointer-events-none" />

      {/* ── Corner Dandiya Sticks ── */}
      <DandiyaDecor position="top-left" />
      <DandiyaDecor position="top-right" />
      <DandiyaDecor position="bottom-left" />
      <DandiyaDecor position="bottom-right" />

      {/* ── Rotating Mandala Background ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
        <MandalaSVG />
      </div>

      {/* ── Floating Orbs ── */}
      <motion.div
        className="absolute top-20 left-[15%] w-64 h-64 rounded-full bg-accent-marigold/5 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-[15%] w-64 h-64 rounded-full bg-accent-pink/5 blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🪅</span>
            <h1 className="text-4xl font-bold bg-gradient-festival bg-clip-text text-transparent tracking-tight">
              GarbaGrid
            </h1>
            <span className="text-3xl">🎊</span>
          </div>
          <p className="text-text-secondary text-sm">
            Delhi-NCR&apos;s Festival Matchmaking
          </p>
        </motion.div>

        {/* Card with festival glow border */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Animated glow border */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-festival opacity-30 animate-pulse-glow blur-[1px]" />

          {/* Card */}
          <div className="relative bg-bg-card rounded-3xl border border-border-primary shadow-card p-8 backdrop-blur-sm">
            {children}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-text-muted text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Made with 💃 for Navratri 2026
        </motion.p>
      </div>
    </div>
  );
}

// ─── Decorative Components ────────────────────────────────────────────────────

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

function DandiyaDecor({ position }: { position: Position }) {
  const positionClasses: Record<Position, string> = {
    'top-left': 'top-4 left-4 rotate-45',
    'top-right': 'top-4 right-4 -rotate-45',
    'bottom-left': 'bottom-4 left-4 -rotate-45',
    'bottom-right': 'bottom-4 right-4 rotate-45',
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} opacity-20`}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <DandiyaSVG />
    </motion.div>
  );
}

function DandiyaSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect
        x="10"
        y="10"
        width="12"
        height="60"
        rx="6"
        fill="url(#dandiyaGrad1)"
      />
      <rect
        x="58"
        y="10"
        width="12"
        height="60"
        rx="6"
        fill="url(#dandiyaGrad2)"
      />
      <circle cx="16" cy="10" r="8" fill="#FF8C00" />
      <circle cx="64" cy="10" r="8" fill="#E91E8C" />
      <circle cx="16" cy="70" r="8" fill="#D4AF37" />
      <circle cx="64" cy="70" r="8" fill="#FF8C00" />
      <defs>
        <linearGradient id="dandiyaGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="dandiyaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E91E8C" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MandalaSVG() {
  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      className="animate-geometric-rotate"
      fill="none"
    >
      {/* Concentric rings */}
      {[40, 80, 120, 160, 200, 240, 280].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          stroke={i % 2 === 0 ? '#FF8C00' : '#E91E8C'}
          strokeWidth="1"
          strokeDasharray={`${4 + i * 2} ${4 + i * 2}`}
        />
      ))}
      {/* Petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = 300 + Math.cos(angle) * 200;
        const y = 300 + Math.sin(angle) * 200;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="25"
            ry="60"
            fill="#D4AF37"
            opacity="0.3"
            transform={`rotate(${(i * 360) / 8} ${x} ${y})`}
          />
        );
      })}
      {/* Center */}
      <circle cx="300" cy="300" r="20" fill="#FF8C00" opacity="0.5" />
    </svg>
  );
}
