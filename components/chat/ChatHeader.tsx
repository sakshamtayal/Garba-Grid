'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, Sparkles, Users, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import type { ChatRoom } from '@/store/chatStore';

interface ChatHeaderProps {
  room: ChatRoom;
  memberCount: number;
  showBack?: boolean;
}

const TYPE_ICONS: Record<ChatRoom['type'], React.ReactNode> = {
  college_channel: <GraduationCap className="w-4 h-4" />,
  general: <Sparkles className="w-4 h-4" />,
  gender_specific: null,
  dm: <MessageCircle className="w-4 h-4" />,
  squad: <Users className="w-4 h-4" />,
};

const TYPE_LABELS: Record<ChatRoom['type'], string> = {
  college_channel: 'College Channel',
  general: 'Festival Chat',
  gender_specific: 'Community',
  dm: 'Direct Message',
  squad: 'Squad',
};

export function ChatHeader({ room, memberCount, showBack = false }: ChatHeaderProps) {
  const router = useRouter();

  const genderEmoji =
    room.type === 'gender_specific'
      ? room.genderFilter === 'female'
        ? '💃'
        : '🕺'
      : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary bg-bg-secondary sticky top-0 z-10">
      {/* Back button (mobile) */}
      {showBack && (
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Room icon */}
      <div className="w-9 h-9 rounded-xl bg-accent-marigold/15 text-accent-marigold flex items-center justify-center flex-shrink-0">
        {genderEmoji ? (
          <span className="text-lg">{genderEmoji}</span>
        ) : (
          TYPE_ICONS[room.type]
        )}
      </div>

      {/* Room info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-text-primary truncate text-sm">{room.name}</h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">{TYPE_LABELS[room.type]}</span>
          {room.college && (
            <>
              <span className="text-border-primary">·</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent-marigold/10 text-accent-marigold border border-accent-marigold/20">
                {room.college}
              </span>
            </>
          )}
          {room.type === 'gender_specific' && (
            <>
              <span className="text-border-primary">·</span>
              <span
                className={clsx(
                  'text-xs px-1.5 py-0.5 rounded-full border',
                  room.genderFilter === 'female'
                    ? 'bg-accent-pink/10 text-accent-pink border-accent-pink/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                )}
              >
                {room.genderFilter === 'female' ? 'Women Only' : 'Men Only'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Member count */}
      {memberCount > 0 && (
        <div className="flex items-center gap-1 text-text-secondary flex-shrink-0">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{memberCount.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
