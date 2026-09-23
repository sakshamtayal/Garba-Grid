'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Users, Star, MessageSquare, Edit3 } from 'lucide-react';
import clsx from 'clsx';
import type { UserProfile } from '@/types';
import { COLLEGE_COLORS, SKILL_META } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileViewProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  connectionCount?: number;
  matchStatus?: 'connected' | 'pending' | 'passed' | null;
  onConnect?: () => void;
  onPass?: () => void;
  onEdit?: () => void;
  onMessage?: () => void;
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

export default function ProfileView({
  profile,
  isOwnProfile = false,
  connectionCount = 0,
  matchStatus,
  onConnect,
  onPass,
  onEdit,
  onMessage,
}: ProfileViewProps) {
  const skill = SKILL_META[profile.dandiayaSkillLevel];
  const collegeColor = COLLEGE_COLORS[profile.college];

  const isCreator = profile.username === 'saksham_tayal';

  return (
    <div className="max-w-xl mx-auto">
      {/* ── Hero Section ── */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Creator badge */}
        {isCreator && (
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-festival/20 border border-accent-gold/30">
              <Star size={14} className="text-accent-gold fill-accent-gold" />
              <span className="text-accent-gold text-sm font-semibold">
                GarbaGrid Creator
              </span>
              <Star size={14} className="text-accent-gold fill-accent-gold" />
            </div>
          </div>
        )}

        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-4 py-8 px-6 bg-bg-card rounded-3xl border border-border-primary relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-festival opacity-10 pointer-events-none" />

          {/* Avatar */}
          <div className="relative">
            <div
              className={clsx(
                'w-28 h-28 rounded-full overflow-hidden border-4 flex-shrink-0',
                isCreator ? 'border-accent-gold shadow-gold' : 'border-border-primary',
              )}
            >
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-marigold flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Edit button overlay for own profile */}
            {isOwnProfile && onEdit && (
              <button
                onClick={onEdit}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent-marigold flex items-center justify-center text-white shadow-marigold hover:bg-accent-marigold-light transition-colors"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {profile.name}
              {profile.age && (
                <span className="text-lg font-normal text-text-muted ml-2">
                  {profile.age}
                </span>
              )}
            </h2>
            <p className="text-text-muted text-sm">@{profile.username}</p>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap justify-center gap-2">
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold border',
                collegeColor,
              )}
            >
              🎓 {profile.college}
            </span>
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold border',
                skill.color,
              )}
            >
              {skill.emoji} {skill.label}
            </span>
            {profile.gender !== 'prefer_not_to_say' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-border-primary bg-bg-secondary text-text-secondary">
                {profile.gender === 'male'
                  ? '♂️ Male'
                  : profile.gender === 'female'
                    ? '♀️ Female'
                    : '⚧️ Non-binary'}
              </span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 pt-2 border-t border-border-primary w-full justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-text-primary">{connectionCount}</p>
              <p className="text-text-muted text-xs">Connections</p>
            </div>
            {profile.instagramId && (
              <Link
                href={`https://instagram.com/${profile.instagramId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-accent-pink hover:text-accent-pink-light transition-colors"
              >
                <Instagram size={16} />@{profile.instagramId}
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Bio ── */}
      {profile.bio && (
        <motion.div
          className="mt-4 p-5 bg-bg-card rounded-2xl border border-border-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2 font-semibold">
            About
          </h3>
          <p className="text-text-secondary leading-relaxed">{profile.bio}</p>
        </motion.div>
      )}

      {/* ── Hobbies ── */}
      {profile.hobbies.length > 0 && (
        <motion.div
          className="mt-4 p-5 bg-bg-card rounded-2xl border border-border-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xs uppercase tracking-wider text-text-muted mb-3 font-semibold">
            Hobbies
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.hobbies.map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 rounded-full bg-bg-secondary border border-border-primary text-text-secondary text-sm"
              >
                {h}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Action Buttons ── */}
      <motion.div
        className="mt-6 flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isOwnProfile ? (
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-marigold text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        ) : isCreator ? (
          <button
            onClick={() =>
              window.open(`https://instagram.com/saksham.tayal`, '_blank')
            }
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-festival text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
          >
            🥁 Send Dandiya Request
          </button>
        ) : matchStatus === 'connected' ? (
          <>
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-green-600/40 bg-green-900/20 text-green-400 text-sm font-medium">
              <Users size={16} />
              Connected ✓
            </div>
            {profile.allowDirectDMs && onMessage && (
              <button
                onClick={onMessage}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-marigold text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
              >
                <MessageSquare size={18} />
                Send Message
              </button>
            )}
          </>
        ) : matchStatus === 'pending' ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-accent-marigold/40 bg-accent-marigold/10 text-accent-marigold text-sm font-medium">
            Connect Request Sent 💫
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onPass}
              className="flex-1 py-3.5 rounded-xl border-2 border-border-primary bg-bg-secondary text-text-secondary hover:border-status-danger hover:text-status-danger hover:bg-status-danger/5 font-semibold text-sm transition-all"
            >
              Pass
            </button>
            <button
              onClick={onConnect}
              className="flex-[2] py-3.5 rounded-xl bg-gradient-marigold text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
            >
              Connect 💫
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
