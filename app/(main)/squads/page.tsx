'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { SquadCard } from '@/components/squads/SquadCard';
import { CreateSquadModal } from '@/components/squads/CreateSquadModal';
import { ISquad } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function SquadSkeleton() {
  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="h-5 bg-bg-secondary rounded-lg w-2/3" />
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => <div key={i} className="w-8 h-8 rounded-full bg-bg-secondary" />)}
      </div>
      <div className="h-10 bg-bg-secondary rounded-xl" />
      <div className="h-9 bg-bg-secondary rounded-xl" />
    </div>
  );
}

export default function SquadsPage() {
  const { data: session } = useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const userId = (session?.user as { id?: string })?.id;

  const { data, isLoading, mutate } = useSWR<{ squads: ISquad[] }>(
    session ? '/api/squads' : null,
    fetcher
  );

  const squads = data?.squads ?? [];

  const handleJoin = useCallback(async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      toast.error('Enter a valid invite code');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/squads/join/${code}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to join');
      toast.success(data.message === 'Already a member' ? 'Already in this squad!' : 'Joined squad! 🎉');
      setJoinCode('');
      mutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setJoining(false);
    }
  }, [joinCode, mutate]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Your Squads <span className="text-accent-pink">💃</span>
          </h1>
          <p className="text-text-secondary">Build your Garba gang and dance together!</p>
        </motion.div>

        {/* Join by Code */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card border border-border-primary rounded-2xl p-5"
        >
          <h2 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-accent-marigold" />
            Join by Invite Code
          </h2>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 8-char code (e.g. A1B2C3D4)"
              maxLength={8}
              className="flex-1 bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm font-mono tracking-widest focus:outline-none focus:border-accent-marigold transition-colors uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
              disabled={joining || joinCode.length < 4}
              className="px-5 py-2.5 rounded-xl bg-accent-marigold text-white font-semibold text-sm hover:bg-accent-marigold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {joining ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              ) : 'Join'}
            </motion.button>
          </div>
        </motion.div>

        {/* My Squads */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-marigold" />
              My Squads
            </h2>
            <span className="text-sm text-text-secondary">{squads.length} squad{squads.length !== 1 ? 's' : ''}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <SquadSkeleton key={i} />)}
            </div>
          ) : squads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-bg-card border border-border-primary rounded-2xl p-10 text-center space-y-3"
            >
              <span className="text-5xl block">🎉</span>
              <p className="text-text-primary font-semibold">No squad yet?</p>
              <p className="text-text-secondary text-sm">Build your Garba gang!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squads.map((squad, i) => (
                <SquadCard
                  key={squad._id}
                  squad={squad}
                  currentUserId={userId}
                  onDisbanded={(id) => mutate({ squads: squads.filter((s) => s._id !== id) })}
                  index={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Squad FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-festival rounded-full shadow-pink-lg flex items-center justify-center z-40"
        title="Create Squad"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <CreateSquadModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(squad) => mutate({ squads: [squad, ...squads] })}
      />
    </div>
  );
}
