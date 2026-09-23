'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: 'dandiya' | 'diya' | 'confetti';
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function DandiyaIllustration() {
  return (
    <motion.svg
      viewBox="0 0 120 100"
      className="w-28 h-24"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
    >
      {/* Left stick */}
      <motion.line
        x1="30" y1="85" x2="65" y2="15"
        stroke="url(#stickGradL)"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ rotate: [-12, 12, -12] }}
        style={{ transformOrigin: '30px 85px' }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Right stick */}
      <motion.line
        x1="90" y1="85" x2="55" y2="15"
        stroke="url(#stickGradR)"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ rotate: [12, -12, 12] }}
        style={{ transformOrigin: '90px 85px' }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Sparks at intersection */}
      <motion.circle
        cx="60" cy="28" r="4"
        fill="#FF8C00"
        animate={{ scale: [0.5, 1.8, 0.5], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="60" cy="28" r="2"
        fill="#FFE57F"
        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <defs>
        <linearGradient id="stickGradL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="50%" stopColor="#E91E8C" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="stickGradR" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#E91E8C" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

function DiyaIllustration() {
  return (
    <motion.svg
      viewBox="0 0 100 80"
      className="w-24 h-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
    >
      {/* Flame glow */}
      <motion.circle
        cx="50" cy="35" r="22"
        fill="#FF8C00"
        opacity="0.15"
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Flame */}
      <motion.path
        d="M50 15 C44 28 40 36 45 44 C48 49 52 49 55 44 C60 36 56 28 50 15 Z"
        fill="url(#dilyaFlameEm)"
        animate={{
          scaleY: [1, 1.15, 0.95, 1],
          scaleX: [1, 0.92, 1.06, 1],
        }}
        style={{ transformOrigin: '50px 45px' }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner flame */}
      <motion.path
        d="M50 25 C47 32 45 37 48 42 C49 44 51 44 52 42 C55 37 53 32 50 25 Z"
        fill="#FFF9C4"
        animate={{ scaleY: [1, 1.2, 1] }}
        style={{ transformOrigin: '50px 43px' }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Diya bowl */}
      <ellipse cx="50" cy="52" rx="34" ry="11" fill="#D4AF37" opacity="0.95" />
      <ellipse cx="50" cy="48" rx="30" ry="8" fill="#A88A1C" />
      <ellipse cx="50" cy="49" rx="24" ry="5.5" fill="#5C4504" />
      {/* Emitted light rays */}
      {[14, 20, 26].map((r, i) => (
        <motion.circle
          key={i}
          cx="50"
          cy="38"
          r={r}
          fill="none"
          stroke="#FF8C00"
          strokeWidth="0.5"
          animate={{ opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
      <defs>
        <radialGradient id="dilyaFlameEm" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#FFF3A3" />
          <stop offset="40%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#E91E8C" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}

export function EmptyState({
  title,
  description,
  illustration = 'diya',
  icon: Icon,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4 py-12 px-6',
        className
      )}
    >
      {/* Illustration / Icon */}
      <div className="mb-2">
        {Icon ? (
          <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border-primary flex items-center justify-center text-accent-marigold">
            <Icon size={32} />
          </div>
        ) : (
          <>
            {illustration === 'dandiya' && <DandiyaIllustration />}
            {illustration === 'diya' && <DiyaIllustration />}
          </>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        )}
      </div>

      {/* CTA */}
      {(action || (actionLabel && onAction)) && (
        <Button
          variant={action?.variant ?? 'primary'}
          size="md"
          onClick={action?.onClick ?? onAction}
          className="mt-2"
        >
          {action?.label ?? actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;
