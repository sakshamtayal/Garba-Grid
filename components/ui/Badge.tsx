'use client';

import * as React from 'react';
import { cn, getCollegeBadgeStyle } from '@/lib/utils';
import type { College, DandiayaSkillLevel, MatchStatus, TicketStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'college' | 'skill' | 'status' | 'custom';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  college?: College;
  skill?: DandiayaSkillLevel;
  status?: MatchStatus | TicketStatus | 'online' | 'offline' | 'away';
  label?: string;
  className?: string;
  children?: React.ReactNode;
  dot?: boolean;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<BadgeSize, string> = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded-md',
  sm: 'text-xs px-2 py-0.5 rounded-md',
  md: 'text-sm px-2.5 py-1 rounded-lg',
};

// ─── College badge styles ─────────────────────────────────────────────────────

const COLLEGE_TW: Record<string, string> = {
  DTU:        'bg-sky-100 text-sky-900 border border-sky-300 font-semibold shadow-sm',
  NSUT:       'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold shadow-sm',
  IGDTUW:     'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 font-semibold shadow-sm',
  NIT:        'bg-cyan-100 text-cyan-900 border border-cyan-300 font-semibold shadow-sm',
  IIIT:       'bg-amber-100 text-amber-900 border border-amber-300 font-semibold shadow-sm',
  'IIT Delhi':'bg-rose-100 text-rose-900 border border-rose-300 font-semibold shadow-sm',
  DU:         'bg-purple-100 text-purple-900 border border-purple-300 font-semibold shadow-sm',
  Other:      'bg-stone-100 text-stone-800 border border-stone-300 font-semibold shadow-sm',
};

// ─── Skill level badge styles ─────────────────────────────────────────────────

const SKILL_META: Record<DandiayaSkillLevel, { label: string; className: string }> = {
  professional: {
    label: '🏆 Professional',
    className: 'bg-amber-100/80 text-amber-900 border border-accent-gold/50 font-semibold',
  },
  chaos_merchant: {
    label: '🌀 Chaos Merchant',
    className: 'bg-pink-100/80 text-pink-900 border border-accent-pink/50 font-semibold',
  },
  left_right_struggler: {
    label: '👣 Left-Right Struggler',
    className: 'bg-bg-secondary text-text-secondary border border-border-primary font-medium',
  },
};

// ─── Status badge styles ──────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-amber-100 text-amber-900 border border-amber-300 font-medium' },
  connected: { label: 'Connected', className: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold' },
  passed:    { label: 'Passed',    className: 'bg-stone-100 text-stone-600 border border-stone-300 font-medium' },
  available: { label: 'Available', className: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold' },
  sold:      { label: 'Sold',      className: 'bg-rose-100 text-rose-900 border border-rose-300 font-medium' },
  reserved:  { label: 'Reserved',  className: 'bg-amber-100 text-amber-900 border border-amber-300 font-medium' },
  online:    { label: 'Online',    className: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold' },
  offline:   { label: 'Offline',   className: 'bg-stone-100 text-stone-600 border border-stone-300 font-medium' },
  away:      { label: 'Away',      className: 'bg-amber-100 text-amber-900 border border-amber-300 font-medium' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant = 'default',
  size = 'sm',
  college,
  skill,
  status,
  label,
  className,
  children,
  dot = false,
}: BadgeProps) {
  let content: React.ReactNode = children ?? label;
  let styles = '';

  if (variant === 'college' && college) {
    styles = COLLEGE_TW[college] || COLLEGE_TW.Other;
    content = content ?? college;
  } else if (variant === 'skill' && skill) {
    const meta = SKILL_META[skill];
    styles = meta.className;
    content = content ?? meta.label;
  } else if (variant === 'status' && status) {
    const meta = STATUS_META[status] ?? STATUS_META.offline;
    styles = meta.className;
    content = content ?? meta.label;
  } else {
    // Default
    styles = 'bg-bg-hover text-text-secondary border border-border-primary';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium whitespace-nowrap',
        sizeMap[size],
        styles,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'status' && status === 'available' && 'bg-green-400',
            variant === 'status' && status === 'sold' && 'bg-red-400',
            variant === 'status' && status === 'reserved' && 'bg-yellow-400',
            variant === 'status' && status === 'online' && 'bg-green-400',
            variant === 'status' && status === 'offline' && 'bg-slate-400',
            variant === 'status' && status === 'away' && 'bg-yellow-400',
          )}
        />
      )}
      {content}
    </span>
  );
}

// ─── Convenience exports ──────────────────────────────────────────────────────

export function CollegeBadge({ college, size = 'sm' }: { college: College; size?: BadgeSize }) {
  return <Badge variant="college" college={college} size={size} />;
}

export function SkillBadge({ skill, size = 'sm' }: { skill: DandiayaSkillLevel; size?: BadgeSize }) {
  return <Badge variant="skill" skill={skill} size={size} />;
}

export function StatusBadge({
  status,
  size = 'sm',
}: {
  status: MatchStatus | TicketStatus | 'online' | 'offline' | 'away';
  size?: BadgeSize;
}) {
  return <Badge variant="status" status={status} size={size} dot />;
}

export default Badge;
