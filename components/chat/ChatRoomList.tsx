'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import {
  GraduationCap,
  Globe,
  Users,
  MessageCircle,
  Hash,
  Sparkles,
} from 'lucide-react';
import type { ChatRoom } from '@/store/chatStore';

interface ChatRoomListProps {
  rooms: {
    college: ChatRoom[];
    general: ChatRoom[];
    genderSpecific: ChatRoom[];
    dms: ChatRoom[];
    squads: ChatRoom[];
  };
  activeRoomId: string | null;
  unreadCounts: Record<string, number>;
  onSelectRoom: (roomId: string) => void;
  searchQuery: string;
}

function RoomIcon({ type, genderFilter }: { type: ChatRoom['type']; genderFilter: string }) {
  if (type === 'college_channel') return <GraduationCap className="w-4 h-4" />;
  if (type === 'general') return <Sparkles className="w-4 h-4" />;
  if (type === 'gender_specific') {
    return genderFilter === 'female' ? (
      <span className="text-sm">💃</span>
    ) : (
      <span className="text-sm">🕺</span>
    );
  }
  if (type === 'dm') return <MessageCircle className="w-4 h-4" />;
  if (type === 'squad') return <Users className="w-4 h-4" />;
  return <Hash className="w-4 h-4" />;
}

function RoomItem({
  room,
  isActive,
  unread,
  onClick,
}: {
  room: ChatRoom;
  isActive: boolean;
  unread: number;
  onClick: () => void;
}) {
  const timeAgo = room.lastActivity
    ? formatDistanceToNow(new Date(room.lastActivity), { addSuffix: false })
        .replace('about ', '')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd')
    : '';

  return (
    <motion.button
      layout
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group',
        isActive
          ? 'bg-accent-marigold/15 border-l-2 border-accent-marigold'
          : 'hover:bg-bg-hover border-l-2 border-transparent'
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon / Avatar */}
      <div
        className={clsx(
          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
          isActive
            ? 'bg-accent-marigold/20 text-accent-marigold'
            : 'bg-bg-card text-text-secondary group-hover:text-accent-marigold'
        )}
      >
        <RoomIcon type={room.type} genderFilter={room.genderFilter} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span
            className={clsx(
              'text-sm font-medium truncate',
              isActive ? 'text-accent-marigold' : 'text-text-primary'
            )}
          >
            {room.name}
          </span>
          {timeAgo && (
            <span className="text-xs text-text-muted flex-shrink-0">{timeAgo}</span>
          )}
        </div>
        {room.lastMessagePreview && (
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {room.lastMessagePreview}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      <AnimatePresence>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-marigold text-bg-primary text-xs font-bold flex items-center justify-center"
          >
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 pt-4 pb-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span className="text-xs text-text-muted">{count}</span>
    </div>
  );
}

export function ChatRoomList({
  rooms,
  activeRoomId,
  unreadCounts,
  onSelectRoom,
  searchQuery,
}: ChatRoomListProps) {
  const filtered = useMemo(() => {
    if (!searchQuery) return rooms;
    const q = searchQuery.toLowerCase();
    const f = (list: ChatRoom[]) =>
      list.filter((r) => r.name.toLowerCase().includes(q));
    return {
      college: f(rooms.college),
      general: f(rooms.general),
      genderSpecific: f(rooms.genderSpecific),
      dms: f(rooms.dms),
      squads: f(rooms.squads),
    };
  }, [rooms, searchQuery]);

  const renderSection = (label: string, list: ChatRoom[]) => {
    if (list.length === 0) return null;
    return (
      <div key={label}>
        <SectionHeader label={label} count={list.length} />
        {list.map((room) => (
          <RoomItem
            key={room._id}
            room={room}
            isActive={activeRoomId === room._id}
            unread={unreadCounts[room._id] ?? 0}
            onClick={() => onSelectRoom(room._id)}
          />
        ))}
      </div>
    );
  };

  const totalRooms =
    rooms.college.length +
    rooms.general.length +
    rooms.genderSpecific.length +
    rooms.dms.length +
    rooms.squads.length;

  if (totalRooms === 0 && !searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <Globe className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No rooms available</p>
      </div>
    );
  }

  const hasResults =
    filtered.college.length +
      filtered.general.length +
      filtered.genderSpecific.length +
      filtered.dms.length +
      filtered.squads.length >
    0;

  if (!hasResults && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <MessageCircle className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No rooms match "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 pb-4">
      {renderSection('College Channels', filtered.college)}
      {renderSection('Festival Chat', filtered.general)}
      {renderSection("Women's Space", filtered.genderSpecific.filter((r) => r.genderFilter === 'female'))}
      {renderSection("Men's Space", filtered.genderSpecific.filter((r) => r.genderFilter === 'male'))}
      {renderSection('Direct Messages', filtered.dms)}
      {renderSection('Squad Chats', filtered.squads)}
    </div>
  );
}
