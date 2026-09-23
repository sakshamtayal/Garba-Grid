'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import type { UserProfile } from '@/lib/types';
import ProfileCard from '@/components/discover/ProfileCard';
import MatchCelebration from '@/components/discover/MatchCelebration';
import { RefreshCw, Users, Bell, Check, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingRequest {
  _id: string;
  from: UserProfile;
  status: string;
  createdAt: string;
}

// ─── Discover Page ────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'discover' | 'requests'>('discover');

  // Discover tab state
  const [queue, setQueue] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [actionDirection, setActionDirection] = useState<'left' | 'right' | null>(null);

  // Requests tab state
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

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

  // ── Fetch Pending Requests ───────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch('/api/matches');
      const json = await res.json();
      if (json.success) {
        setRequests(json.data.pending || []);
      } else {
        toast.error('Failed to load requests');
      }
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchRequests();
  }, [fetchQueue, fetchRequests]);

  // ── Handle Swipe Action ──────────────────────────────────────────────────

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
          // Remove from requests list if they had sent a request to us
          setRequests((prev) =>
            prev.filter((r) => r.from._id !== currentProfile._id)
          );
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
    [currentProfile, isActing]
  );

  // ── Handle Accept / Decline ──────────────────────────────────────────────

  const handleRequestAction = async (
    matchId: string,
    action: 'accept' | 'decline',
    fromUser: UserProfile
  ) => {
    if (actingOn) return;
    setActingOn(matchId);

    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'Action failed');
        return;
      }

      // Remove from list optimistically
      setRequests((prev) => prev.filter((r) => r._id !== matchId));

      if (action === 'accept') {
        setMatchedUser(fromUser);
        setShowCelebration(true);
        toast.success("You're now connected! 🎉");
      } else {
        toast.success('Request declined.');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActingOn(null);
    }
  };

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showCelebration || activeTab !== 'discover') return;
      if (e.key === 'ArrowLeft') handleAction('pass');
      if (e.key === 'ArrowRight') handleAction('connect');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAction, showCelebration, activeTab]);

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
              {activeTab === 'discover'
                ? queue.length > 0
                  ? `${queue.length} people waiting`
                  : 'Queue empty'
                : requests.length > 0
                ? `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`
                : 'No pending requests'}
            </p>
          </div>
          <button
            onClick={activeTab === 'discover' ? fetchQueue : fetchRequests}
            disabled={isLoading || requestsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm"
          >
            <RefreshCw
              size={14}
              className={isLoading || requestsLoading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex max-w-2xl mx-auto mt-3 gap-1 bg-bg-card rounded-xl p-1 border border-border-primary">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-gradient-marigold text-white shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users size={14} />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'requests'
                ? 'bg-gradient-marigold text-white shadow'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Bell size={14} />
            Requests
            {requests.length > 0 && (
              <span className="absolute top-1.5 right-3 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {requests.length > 9 ? '9+' : requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard hint (Discover tab only) */}
      {activeTab === 'discover' && (
        <div className="hidden md:flex items-center justify-center gap-6 py-3 text-text-muted text-xs border-b border-border-primary/50">
          <span>⬅️ Arrow Left = Pass</span>
          <span>➡️ Arrow Right = Connect</span>
        </div>
      )}

      {/* ── DISCOVER TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'discover' && (
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
      )}

      {/* ── REQUESTS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {requestsLoading ? (
            <RequestsSkeleton />
          ) : requests.length === 0 ? (
            <NoRequestsState />
          ) : (
            <div className="space-y-3">
              <p className="text-text-muted text-xs mb-4">
                These people want to connect with you. Accept to match! 🎉
              </p>
              <AnimatePresence>
                {requests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-4 bg-bg-card border border-border-primary rounded-2xl p-4 hover:border-border-accent transition-all"
                  >
                    {/* Avatar */}
                    <Link
                      href={`/profile/${req.from.username}`}
                      className="relative flex-shrink-0"
                    >
                      {req.from.profilePicture ? (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-border-accent">
                          <Image
                            src={req.from.profilePicture}
                            alt={req.from.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-bg-hover border-2 border-border-accent flex items-center justify-center text-xl">
                          {req.from.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${req.from.username}`}>
                        <p className="font-semibold text-text-primary truncate hover:underline">
                          {req.from.name}
                        </p>
                      </Link>
                      <p className="text-text-muted text-xs truncate">
                        @{req.from.username}
                        {req.from.college ? ` · ${req.from.college}` : ''}
                      </p>
                      {req.from.dandiayaSkillLevel && (
                        <p className="text-text-muted text-xs mt-0.5">
                          🪇 {req.from.dandiayaSkillLevel}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleRequestAction(req._id, 'accept', req.from)
                        }
                        disabled={actingOn === req._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-marigold text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                        title="Accept"
                      >
                        <Check size={14} />
                        <span className="hidden sm:inline">Accept</span>
                      </button>
                      <button
                        onClick={() =>
                          handleRequestAction(req._id, 'decline', req.from)
                        }
                        disabled={actingOn === req._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-primary text-text-secondary hover:text-status-danger hover:border-status-danger text-sm font-medium transition-all disabled:opacity-50"
                        title="Decline"
                      >
                        <X size={14} />
                        <span className="hidden sm:inline">Decline</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

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

function RequestsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-bg-card border border-border-primary rounded-2xl p-4"
        >
          <div className="w-14 h-14 rounded-full bg-bg-hover flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-bg-hover rounded w-1/2" />
            <div className="h-3 bg-bg-hover rounded w-1/3" />
          </div>
          <div className="flex gap-2">
            <div className="w-20 h-9 bg-bg-hover rounded-xl" />
            <div className="w-20 h-9 bg-bg-hover rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty States ──────────────────────────────────────────────────────────────

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
          onClick={() => (window.location.href = '/profile')}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm"
        >
          <Users size={16} />
          View My Connections
        </button>
      </div>
      <p className="text-text-muted text-xs">
        Tip: Use ← → arrow keys to pass / connect
      </p>
    </motion.div>
  );
}

function NoRequestsState() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center py-16 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-20 h-20 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-4xl">
        🪅
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary">No requests yet</h3>
        <p className="text-text-secondary text-sm mt-1">
          When someone connects with you, they&apos;ll appear here.
        </p>
      </div>
    </motion.div>
  );
}
