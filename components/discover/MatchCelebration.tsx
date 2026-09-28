'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Compass, Copy, Check, Instagram } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface MatchCelebrationProps {
  matchedUser: UserProfile;
  currentUser: { name: string; profilePicture?: string };
  currentUserInstaId?: string;
  onClose: () => void;
}

// ─── Confetti Particle ────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#FF8C00',
  '#E91E8C',
  '#D4AF37',
  '#FF4DA6',
  '#FFA333',
  '#F0CE5E',
];

function ConfettiParticle({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const x = (Math.random() - 0.5) * 600;
  const y = -Math.random() * 300 - 100;
  const rotate = Math.random() * 720 - 360;
  const size = Math.random() * 10 + 6;
  const delay = Math.random() * 0.5;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size * 0.4,
        backgroundColor: color,
        originX: '50%',
        originY: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        x,
        y,
        opacity: 0,
        rotate,
        scale: 0,
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-marigold/20 hover:bg-accent-marigold/30 text-accent-marigold text-xs font-semibold transition-all"
      title="Copy Instagram ID"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Match Celebration Modal ──────────────────────────────────────────────────

export default function MatchCelebration({
  matchedUser,
  currentUser,
  currentUserInstaId,
  onClose,
}: MatchCelebrationProps) {
  const router = useRouter();

  // Auto-close after 12 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 12000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleMessage = () => {
    onClose();
    router.push(`/chat?dm=${matchedUser.username}`);
  };

  const hasInsta = !!matchedUser.instagramId;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-sm bg-bg-card rounded-3xl border border-border-primary shadow-card overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      >
        {/* Festival Glow */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-festival opacity-30 pointer-events-none" />

        <div className="relative p-6">
          {/* Title */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-festival bg-clip-text text-transparent">
              It&apos;s a Match!
            </h2>
            <p className="text-text-secondary text-sm mt-2">
              💃 You and {matchedUser.name} connected! 🕺
            </p>
          </motion.div>

          {/* Avatars */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Current user avatar */}
            <motion.div
              className="relative"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Avatar
                name={currentUser.name}
                picture={currentUser.profilePicture}
                size={72}
              />
            </motion.div>

            {/* Heart */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <Heart
                size={32}
                className="text-accent-pink fill-accent-pink drop-shadow-lg"
              />
            </motion.div>

            {/* Matched user avatar */}
            <motion.div
              className="relative"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Avatar
                name={matchedUser.name}
                picture={matchedUser.profilePicture}
                size={72}
              />
            </motion.div>
          </div>

          {/* ── Instagram Exchange Section ─────────────────────────── */}
          {hasInsta && (
            <motion.div
              className="mb-5 rounded-2xl border border-accent-marigold/40 bg-accent-marigold/5 p-4 space-y-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 text-accent-marigold font-bold text-sm">
                <Instagram size={15} />
                Instagram Exchange 🎯
              </div>

              {/* Their Insta */}
              <div className="rounded-xl bg-bg-secondary border border-border-primary p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-semibold">
                  {matchedUser.name}&apos;s Instagram
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-accent-pink font-bold text-sm">
                    @{matchedUser.instagramId}
                  </span>
                  <CopyButton text={matchedUser.instagramId!} />
                </div>
              </div>

              {/* Your Insta */}
              {currentUserInstaId && (
                <div className="rounded-xl bg-bg-secondary border border-border-primary p-3">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-semibold">
                    Your Instagram
                  </p>
                  <span className="text-accent-marigold font-bold text-sm">
                    @{currentUserInstaId}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-text-muted text-center">
                Share your Instagram with each other and connect! ✨
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={handleMessage}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-festival text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
            >
              <MessageSquare size={18} />
              Send a Message 💌
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm font-medium"
            >
              <Compass size={16} />
              Keep Discovering
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Avatar Helper ────────────────────────────────────────────────────────────

function Avatar({
  name,
  picture,
  size,
}: {
  name: string;
  picture?: string;
  size: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden border-4 border-border-primary shadow-gold bg-gradient-marigold flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {picture ? (
        <Image src={picture} alt={name} width={size} height={size} className="object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
