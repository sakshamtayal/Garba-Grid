'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, isToday, isYesterday } from 'date-fns';
import clsx from 'clsx';
import type { Message } from '@/store/chatStore';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp: boolean;
  showAvatar: boolean;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

function Avatar({ sender }: { sender: Message['sender'] }) {
  const initials = sender.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-bg-card border border-border-primary">
      {sender.profilePicture ? (
        <Image
          src={sender.profilePicture}
          alt={sender.name}
          width={32}
          height={32}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent-marigold bg-accent-marigold/10">
          {initials}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({
  message,
  isOwn,
  showTimestamp,
  showAvatar,
}: MessageBubbleProps) {
  const timeStr = formatMessageTime(message.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx('flex gap-2 px-4', isOwn ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar (others only) */}
      {!isOwn && (
        <div className="flex-shrink-0 mt-auto">
          {showAvatar ? <Avatar sender={message.sender} /> : <div className="w-8" />}
        </div>
      )}

      {/* Bubble + meta */}
      <div
        className={clsx(
          'flex flex-col max-w-[70%] gap-1',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name (others only, first of group) */}
        {!isOwn && showAvatar && (
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs font-semibold text-accent-marigold">
              {message.sender.name}
            </span>
            <span className="text-xs text-text-muted">{message.sender.college}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={clsx(
            'relative group rounded-2xl px-4 py-2.5 break-words',
            isOwn
              ? 'bg-gradient-to-br from-accent-marigold to-accent-pink text-white rounded-tr-sm'
              : 'bg-bg-card text-text-primary border border-border-primary rounded-tl-sm',
            message.optimistic && 'opacity-70'
          )}
        >
          {message.type === 'image' ? (
            <div className="rounded-xl overflow-hidden max-w-[240px]">
              <Image
                src={message.content}
                alt="Image message"
                width={240}
                height={180}
                className="object-cover w-full"
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Timestamp tooltip on hover */}
          <span
            className={clsx(
              'absolute -bottom-5 text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none',
              isOwn ? 'right-1' : 'left-1'
            )}
          >
            {timeStr}
          </span>
        </div>

        {/* Timestamp line (shown every N messages or time gap) */}
        {showTimestamp && (
          <span
            className={clsx(
              'text-xs text-text-muted px-1 mt-0.5',
              isOwn ? 'text-right' : 'text-left'
            )}
          >
            {timeStr}
          </span>
        )}
      </div>
    </motion.div>
  );
}
