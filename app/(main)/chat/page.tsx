'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, X, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import type { ChatRoom } from '@/store/chatStore';

interface RoomGroups {
  college: ChatRoom[];
  general: ChatRoom[];
  genderSpecific: ChatRoom[];
  dms: ChatRoom[];
  squads: ChatRoom[];
}

export default function ChatPage() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const { activeRoomId, setActiveRoom, unreadCounts, rooms, setRooms } = useChatStore();

  const [roomGroups, setRoomGroups] = useState<RoomGroups>({
    college: [],
    general: [],
    genderSpecific: [],
    dms: [],
    squads: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDM, setShowNewDM] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [isCreatingDM, setIsCreatingDM] = useState(false);

  // ── Fetch rooms ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/chat/rooms');
        if (!res.ok) return;
        const data = await res.json();
        setRoomGroups(data.rooms);
        const allRooms = [
          ...data.rooms.college,
          ...data.rooms.general,
          ...data.rooms.genderSpecific,
          ...data.rooms.dms,
          ...data.rooms.squads,
        ];
        setRooms(allRooms);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (status === 'authenticated') fetchRooms();
  }, [status]);

  // ── Fetch connections for DM modal ─────────────────────────────────────────
  useEffect(() => {
    if (!showNewDM) return;
    fetch('/api/connections?status=accepted')
      .then((r) => r.json())
      .then((d) => setConnections(d.connections ?? []))
      .catch(() => {});
  }, [showNewDM]);

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      setActiveRoom(roomId);
      router.push(`/chat/${roomId}`);
    },
    [router, setActiveRoom]
  );

  const handleCreateDM = async (targetUserId: string) => {
    setIsCreatingDM(true);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) return;
      const { room } = await res.json();
      setShowNewDM(false);
      router.push(`/chat/${room._id}`);
    } catch (err) {
      console.error('Failed to create DM', err);
    } finally {
      setIsCreatingDM(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent-marigold" />
          <p className="text-text-secondary text-sm">Loading chats…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-border-primary bg-bg-secondary flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border-primary">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent-marigold" />
              Chats
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewDM(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-marigold/15 text-accent-marigold text-xs font-medium hover:bg-accent-marigold/25 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New DM
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms…"
              className="w-full bg-bg-card border border-border-primary rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-marigold/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-primary">
          <ChatRoomList
            rooms={roomGroups}
            activeRoomId={activeRoomId}
            unreadCounts={unreadCounts}
            onSelectRoom={handleSelectRoom}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* ── Empty State (desktop) ────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="text-6xl mb-4">🪔</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Navratri Chat</h2>
          <p className="text-text-secondary text-sm max-w-xs">
            Select a channel to start chatting with fellow festival lovers!
          </p>
        </div>
      </div>

      {/* ── New DM Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewDM && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewDM(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border-primary rounded-2xl p-6 w-full max-w-md shadow-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Start a Direct Message</h3>
                <button
                  onClick={() => setShowNewDM(false)}
                  className="p-1 rounded-lg hover:bg-bg-hover text-text-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {connections.length === 0 ? (
                <p className="text-text-secondary text-sm text-center py-8">
                  Connect with people first to start a DM!
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {connections.map((conn: any) => {
                    const other = conn.requester?._id === (session?.user as any)?._id
                      ? conn.recipient
                      : conn.requester;
                    return (
                      <button
                        key={conn._id}
                        onClick={() => handleCreateDM(other._id)}
                        disabled={isCreatingDM}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors text-left disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-accent-marigold/15 flex items-center justify-center text-accent-marigold font-bold text-sm">
                          {(other?.name ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{other?.name}</p>
                          <p className="text-xs text-text-muted">{other?.college}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
