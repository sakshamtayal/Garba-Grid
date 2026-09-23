'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import type { UserProfile } from '@/lib/types';
import ProfileCard from '@/components/discover/ProfileCard';
import MatchCelebration from '@/components/discover/MatchCelebration';
import { RefreshCw, Users } from 'lucide-react';
import clsx from 'clsx';

// ─── Discover Page ────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [actionDirection, setActionDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = queue[0] ?? null;

  // ── Fetch Queue ──────────────────────────────────────────────────────────

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/matches/queue');
      const json = await res.json();
      if (json.success) {
        setQueue(json.data);
      } else {
        toast.error('Failed to load profiles');
      }
    } catch {
      toast.error('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ── Handle Action ────────────────────────────────────────────────────────

  const handleAction = useCallback(
    async (action: 'connect' | 'pass') => {
      if (!currentProfile || isActing) return;

      setIsActing(true);
      setActionDirection(action === 'connect' ? 'right' : 'left');

      // Optimistically remove card
      setQueue((prev) => prev.slice(1));

      try {
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserId: currentProfile._id,
            action,
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          toast.error(json.error || 'Action failed');
          return;
        }

        if (json.data.isMutualMatch && json.data.connectedUser) {
          setMatchedUser(json.data.connectedUser as UserProfile);
          setShowCelebration(true);
        } else if (action === 'connect') {
          toast.success('Connect request sent! 💫', { duration: 2000 });
        }
      } catch {
        toast.error('Something went wrong');
      } finally {
        setIsActing(false);
        setActionDirection(null);
      }
    },
    [currentProfile, isActing],
  );

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showCelebration) return;
      if (e.key === 'ArrowLeft') handleAction('pass');
      if (e.key === 'ArrowRight') handleAction('connect');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAction, showCelebration]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <span>🪅</span> Discover
            </h1>
            <p className="text-text-muted text-xs mt-0.5">
              {queue.length > 0 ? `${queue.length} people waiting` : 'Queue empty'}
            </p>
          </div>
          <button
            onClick={fetchQueue}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="hidden md:flex items-center justify-center gap-6 py-3 text-text-muted text-xs border-b border-border-primary/50">
        <span>⬅️ Arrow Left = Pass</span>
        <span>⬆️ Right Arrow = Connect</span>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <DiscoverSkeleton />
        ) : queue.length === 0 ? (
          <EmptyState onRefresh={fetchQueue} />
        ) : (
          <div className="relative w-full max-w-md">
            {/* Stack peek cards (next 2) */}
            {queue.slice(1, 3).map((profile, i) => (
              <div
                key={profile._id}
                className="absolute inset-0"
                style={{
                  transform: `translateY(${(i + 1) * 8}px) scale(${1 - (i + 1) * 0.04})`,
                  zIndex: 10 - i,
                  opacity: 1 - i * 0.3,
                }}
              >
                <div className="w-full h-[520px] bg-bg-card rounded-3xl border border-border-primary" />
              </div>
            ))}

            {/* Active Card */}
            <AnimatePresence mode="wait">
              {currentProfile && (
                <motion.div
                  key={currentProfile._id}
                  className="relative z-20"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: 0,
                    rotate: 0,
                  }}
                  exit={{
                    x: actionDirection === 'right' ? 400 : -400,
                    rotate: actionDirection === 'right' ? 15 : -15,
                    opacity: 0,
                    scale: 0.9,
                  }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) handleAction('connect');
                    else if (info.offset.x < -100) handleAction('pass');
                  }}
                >
                  <ProfileCard
                    profile={currentProfile}
                    onPass={() => handleAction('pass')}
                    onConnect={() => handleAction('connect')}
                    isActing={isActing}
                    currentUsername={
                      (session?.user as { username?: string })?.username
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Match Celebration Modal */}
      <AnimatePresence>
        {showCelebration && matchedUser && (
          <MatchCelebration
            matchedUser={matchedUser}
            currentUser={{
              name: session?.user?.name || 'You',
              profilePicture: (session?.user as { profilePicture?: string })
                ?.profilePicture,
            }}
            onClose={() => {
              setShowCelebration(false);
              setMatchedUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DiscoverSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="bg-bg-card rounded-3xl border border-border-primary overflow-hidden h-[520px]">
        {/* Image placeholder */}
        <div className="h-72 bg-bg-hover" />
        {/* Content placeholder */}
        <div className="p-6 space-y-3">
          <div className="h-6 bg-bg-hover rounded-lg w-3/4" />
          <div className="flex gap-2">
            <div className="h-5 bg-bg-hover rounded-full w-20" />
            <div className="h-5 bg-bg-hover rounded-full w-24" />
          </div>
          <div className="h-4 bg-bg-hover rounded w-full" />
          <div className="h-4 bg-bg-hover rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 text-center py-12 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-24 h-24 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-5xl">
        🎊
      </div>
      <div>
        <h3 className="text-xl font-bold text-text-primary">
          You&apos;ve seen everyone!
        </h3>
        <p className="text-text-secondary text-sm mt-2">
          More dancers are joining every day. Check back soon!
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-marigold text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all"
        >
          <RefreshCw size={16} />
          Refresh Queue
        </button>
        <button
          onClick={() => window.location.href = '/profile'}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm"
        >
          <Users size={16} />
          View My Connections
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-text-muted text-xs">
        Tip: Use ← → arrow keys to pass / connect
      </p>
    </motion.div>
  );
}
