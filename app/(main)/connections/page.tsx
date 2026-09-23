'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, Users, Clock, MessageSquare, ArrowLeft, UserX } from 'lucide-react';
import DandiayaLoader from '@/components/ui/DandiayaLoader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConnectedUser {
  matchId: string;
  user: {
    _id: string;
    username: string;
    name: string;
    college: string;
    gender: string;
    age?: number;
    bio?: string;
    profilePicture?: string;
    hobbies?: string[];
    dandiayaSkillLevel?: string;
    instagramId?: string;
    allowDirectDMs?: boolean;
  };
  connectedAt: string | null;
}

interface SentRequest {
  matchId: string;
  user: {
    _id: string;
    username: string;
    name: string;
    college: string;
    profilePicture?: string;
    dandiayaSkillLevel?: string;
  };
  sentAt: string | null;
}

// ─── Connections Page ─────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'connected' | 'sent'>('connected');
  const [connected, setConnected] = useState<ConnectedUser[]>([]);
  const [sent, setSent] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dmLoading, setDmLoading] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connections');
      const json = await res.json();
      if (json.success) {
        setConnected(json.data.connected || []);
        setSent(json.data.sent || []);
      } else {
        toast.error('Failed to load connections');
      }
    } catch {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredConnected = useMemo(() => {
    if (!search.trim()) return connected;
    const q = search.toLowerCase();
    return connected.filter(
      (c) =>
        c.user.name.toLowerCase().includes(q) ||
        c.user.username.toLowerCase().includes(q) ||
        c.user.college?.toLowerCase().includes(q)
    );
  }, [connected, search]);

  const filteredSent = useMemo(() => {
    if (!search.trim()) return sent;
    const q = search.toLowerCase();
    return sent.filter(
      (s) =>
        s.user.name.toLowerCase().includes(q) ||
        s.user.username.toLowerCase().includes(q)
    );
  }, [sent, search]);

  // ── Start DM ──────────────────────────────────────────────────────────────

  const handleMessage = async (userId: string) => {
    if (dmLoading) return;
    setDmLoading(userId);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Could not open DM');
        return;
      }
      router.push(`/chat/${json.room._id}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDmLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-bg-hover transition-colors text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users size={20} className="text-accent-marigold" />
            My Connections
          </h1>
          <p className="text-text-muted text-xs mt-0.5">
            {connected.length} connected · {sent.length} request{sent.length !== 1 ? 's' : ''} sent
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username or college…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-primary text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-border-accent transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1 border border-border-primary mb-6">
        <button
          onClick={() => setActiveTab('connected')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'connected'
              ? 'bg-gradient-marigold text-white shadow'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Users size={14} />
          Connected
          {connected.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'connected' ? 'bg-white/20' : 'bg-bg-hover text-text-muted'}`}>
              {connected.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sent'
              ? 'bg-gradient-marigold text-white shadow'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Clock size={14} />
          Sent Requests
          {sent.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'sent' ? 'bg-white/20' : 'bg-bg-hover text-text-muted'}`}>
              {sent.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <DandiayaLoader size="lg" />
          <p className="text-text-muted text-sm">Loading connections…</p>
        </div>
      ) : activeTab === 'connected' ? (
        <ConnectedList
          items={filteredConnected}
          search={search}
          onMessage={handleMessage}
          dmLoading={dmLoading}
        />
      ) : (
        <SentList items={filteredSent} search={search} />
      )}
    </div>
  );
}

// ─── Connected List ───────────────────────────────────────────────────────────

function ConnectedList({
  items,
  search,
  onMessage,
  dmLoading,
}: {
  items: ConnectedUser[];
  search: string;
  onMessage: (userId: string) => void;
  dmLoading: string | null;
}) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-4xl">
          {search ? '🔍' : '🪅'}
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {search ? 'No results found' : 'No connections yet'}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {search
              ? 'Try a different search term'
              : 'Go to Discover and start connecting with people!'}
          </p>
        </div>
        {!search && (
          <Link
            href="/discover"
            className="px-5 py-2.5 rounded-xl bg-gradient-marigold text-white text-sm font-semibold shadow-marigold hover:opacity-90 transition-all"
          >
            Go to Discover
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.matchId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 bg-bg-card border border-border-primary rounded-2xl p-4 hover:border-border-accent transition-all"
          >
            {/* Avatar */}
            <Link href={`/profile/${item.user.username}`} className="flex-shrink-0">
              {item.user.profilePicture ? (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-green-500/50">
                  <Image
                    src={item.user.profilePicture}
                    alt={item.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-bg-hover border-2 border-green-500/50 flex items-center justify-center text-xl font-bold text-text-primary">
                  {item.user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${item.user.username}`}>
                <p className="font-semibold text-text-primary truncate hover:underline">
                  {item.user.name}
                </p>
              </Link>
              <p className="text-text-muted text-xs truncate">
                @{item.user.username}
                {item.user.college ? ` · ${item.user.college}` : ''}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-900/20 border border-green-600/30 text-green-400 text-[10px] font-semibold">
                  ✓ Connected
                </span>
                {item.user.dandiayaSkillLevel && (
                  <span className="text-text-muted text-[10px]">
                    🪇 {item.user.dandiayaSkillLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onMessage(item.user._id)}
                disabled={dmLoading === item.user._id}
                title="Send Message"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-marigold text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {dmLoading === item.user._id ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <MessageSquare size={14} />
                )}
                <span className="hidden sm:inline">Message</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}

// ─── Sent Requests List ───────────────────────────────────────────────────────

function SentList({
  items,
  search,
}: {
  items: SentRequest[];
  search: string;
}) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-bg-card border border-border-primary flex items-center justify-center text-4xl">
          {search ? '🔍' : <UserX size={32} className="text-text-muted" />}
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {search ? 'No results found' : 'No pending requests'}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {search
              ? 'Try a different search term'
              : 'When you send a connect request, it will appear here.'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-3">
        <p className="text-text-muted text-xs mb-3">
          Waiting for them to accept your request…
        </p>
        {items.map((item) => (
          <motion.div
            key={item.matchId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-4 bg-bg-card border border-border-primary rounded-2xl p-4 hover:border-border-accent transition-all"
          >
            {/* Avatar */}
            <Link href={`/profile/${item.user.username}`} className="flex-shrink-0">
              {item.user.profilePicture ? (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-accent-marigold/40">
                  <Image
                    src={item.user.profilePicture}
                    alt={item.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-bg-hover border-2 border-accent-marigold/40 flex items-center justify-center text-xl font-bold text-text-primary">
                  {item.user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${item.user.username}`}>
                <p className="font-semibold text-text-primary truncate hover:underline">
                  {item.user.name}
                </p>
              </Link>
              <p className="text-text-muted text-xs truncate">
                @{item.user.username}
              </p>
              {item.user.dandiayaSkillLevel && (
                <p className="text-text-muted text-[10px] mt-0.5">
                  🪇 {item.user.dandiayaSkillLevel}
                </p>
              )}
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent-marigold/40 bg-accent-marigold/10 text-accent-marigold text-xs font-semibold">
                <Clock size={11} />
                Pending
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
