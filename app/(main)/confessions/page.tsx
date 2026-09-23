'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, Plus, Sparkles, Filter, Lock } from 'lucide-react';
import ConfessionCard from '@/components/confessions/ConfessionCard';
import PostConfessionModal from '@/components/confessions/PostConfessionModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import DandiayaLoader from '@/components/ui/DandiayaLoader';
import { Confession, College } from '@/types';
import axios from 'axios';
import toast from 'react-hot-toast';

const COLLEGES: (College | 'All')[] = ['All', 'DTU', 'NSUT', 'IGDTUW', 'NIT', 'IIIT', 'IIT Delhi', 'DU', 'Other'];

export default function ConfessionsPage() {
  const { data: session } = useSession();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<College | 'All'>('All');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchConfessions();
  }, [selectedCollege]);

  const fetchConfessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/confessions', {
        params: { college: selectedCollege === 'All' ? undefined : selectedCollege },
      });
      setConfessions(res.data.confessions || []);
    } catch {
      toast.error('Failed to fetch confessions.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfessionPosted = (newConfession: Confession) => {
    // If auto-approved or in feed
    if (newConfession.isApproved) {
      setConfessions((prev) => [newConfession, ...prev]);
    }
  };

  const handleReport = (id: string) => {
    setConfessions((prev) => prev.filter((c) => c._id !== id));
  };

  const currentUserId = (session?.user as { id?: string })?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-bg-card via-bg-secondary to-bg-card p-6 rounded-3xl border border-accent-pink/30 shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-accent-pink/5 blur-2xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-xs font-semibold mb-2">
            <Lock size={12} />
            <span>100% Anonymous Campus Wall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Confession Hub 🤫
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-lg">
            Festive crushes, outfit hype, dance battles, and unsaid Dandiya shout-outs across Delhi-NCR colleges.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsPostModalOpen(true)}
          className="shadow-pink flex items-center gap-2 self-start sm:self-center flex-shrink-0 bg-gradient-pink text-white"
        >
          <Plus size={18} />
          <span>Confess 🤫</span>
        </Button>
      </div>

      {/* College Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COLLEGES.map((college) => (
          <button
            key={college}
            onClick={() => setSelectedCollege(college)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCollege === college
                ? 'bg-gradient-pink text-white shadow-pink scale-105'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card border border-border-primary'
            }`}
          >
            {college === 'All' ? '🌟 All Colleges' : college}
          </button>
        ))}
      </div>

      {/* Confession Cards Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <DandiayaLoader size="lg" />
          <p className="text-text-muted text-sm">Tuning into festive whispers...</p>
        </div>
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No confessions here yet"
          description="Be the first to drop an anonymous festival confession or shout-out!"
          actionLabel="Drop Confession"
          onAction={() => setIsPostModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession._id}
              confession={confession}
              currentUserId={currentUserId}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* Post Modal */}
      <PostConfessionModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onConfessionPosted={handleConfessionPosted}
      />
    </div>
  );
}
