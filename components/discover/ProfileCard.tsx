'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, ChevronDown, ChevronUp, X, Heart } from 'lucide-react';
import clsx from 'clsx';
import type { UserProfile } from '@/lib/types';
import { COLLEGE_COLORS, SKILL_META } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: UserProfile;
  onPass: () => void;
  onConnect: () => void;
  isActing: boolean;
  currentUsername?: string;
}

import RoyalCornerMotif from '@/components/ui/RoyalCornerMotif';

// ─── ProfileCard ──────────────────────────────────────────────────────────────

export default function ProfileCard({
  profile,
  onPass,
  onConnect,
  isActing,
}: ProfileCardProps) {
  const [bioExpanded, setBioExpanded] = useState(false);

  const skill = SKILL_META[profile.dandiayaSkillLevel];
  const collegeColor = COLLEGE_COLORS[profile.college] || COLLEGE_COLORS.Other;

  const truncatedBio =
    profile.bio && profile.bio.length > 80
      ? profile.bio.slice(0, 80) + '…'
      : profile.bio;

  return (
    <div
      className="relative w-full bg-bg-card rounded-3xl border-2 border-accent-gold/40 overflow-hidden shadow-[0_0_25px_rgba(212,175,55,0.15)] select-none"
      style={{ height: '520px' }}
    >
      {/* ── Inner Hairline Frame ── */}
      <div className="absolute inset-1.5 rounded-[22px] border border-accent-gold/20 pointer-events-none z-20" />

      {/* ── Ornate Corner Filigree ── */}
      <RoyalCornerMotif size="sm" variant="gold" />

      {/* ── Festival Glow Border ── */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-festival opacity-20 pointer-events-none z-10" />

      {/* ── Profile Photo ── */}
      <div className="relative h-72 bg-bg-secondary overflow-hidden">
        {profile.profilePicture ? (
          <Image
            src={profile.profilePicture}
            alt={profile.name}
            fill
            className="object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-card">
            <span className="text-8xl opacity-20">🎊</span>
            <div className="absolute text-6xl font-bold text-text-muted">
              {profile.name[0]?.toUpperCase()}
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {/* College badge */}
          <span
            className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm',
              collegeColor,
            )}
          >
            {profile.college}
          </span>

          {/* Instagram link */}
          {profile.instagramId && (
            <Link
              href={`https://instagram.com/${profile.instagramId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-pink-400 hover:text-pink-300 border border-pink-400/30 text-xs font-medium transition-colors"
            >
              <Instagram size={12} />@{profile.instagramId}
            </Link>
          )}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                {profile.name}
                {profile.age && (
                  <span className="text-lg font-normal text-white/70 ml-2">
                    {profile.age}
                  </span>
                )}
              </h3>
            </div>
            {/* Skill badge */}
            <span
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm',
                skill.color,
              )}
            >
              {skill.emoji} {skill.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="px-5 py-4 flex flex-col gap-3 h-[calc(520px-18rem)]">
        {/* Bio */}
        {profile.bio && (
          <div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {bioExpanded ? profile.bio : truncatedBio}
            </p>
            {profile.bio.length > 80 && (
              <button
                type="button"
                onClick={() => setBioExpanded((v) => !v)}
                className="flex items-center gap-1 text-accent-marigold text-xs mt-1 hover:text-accent-marigold-light transition-colors"
              >
                {bioExpanded ? (
                  <>
                    <ChevronUp size={12} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> Read more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Hobbies */}
        {profile.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.hobbies.slice(0, 5).map((hobby) => (
              <span
                key={hobby}
                className="px-2.5 py-1 rounded-full bg-bg-secondary border border-border-primary text-text-secondary text-xs"
              >
                {hobby}
              </span>
            ))}
            {profile.hobbies.length > 5 && (
              <span className="px-2.5 py-1 rounded-full bg-bg-secondary border border-border-primary text-text-muted text-xs">
                +{profile.hobbies.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          {/* Pass */}
          <motion.button
            type="button"
            onClick={onPass}
            disabled={isActing}
            whileHover={{ scale: isActing ? 1 : 1.05 }}
            whileTap={{ scale: isActing ? 1 : 0.95 }}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200',
              'border-border-primary bg-bg-secondary text-text-secondary',
              'hover:border-status-danger hover:text-status-danger hover:bg-status-danger/5',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <X size={18} />
            Pass
          </motion.button>

          {/* Connect */}
          <motion.button
            type="button"
            onClick={onConnect}
            disabled={isActing}
            whileHover={{ scale: isActing ? 1 : 1.05 }}
            whileTap={{ scale: isActing ? 1 : 0.95 }}
            className={clsx(
              'flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200',
              'bg-gradient-marigold text-white shadow-marigold',
              'hover:shadow-marigold-lg',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <Heart size={18} />
            Connect
          </motion.button>
        </div>
      </div>
    </div>
  );
}
