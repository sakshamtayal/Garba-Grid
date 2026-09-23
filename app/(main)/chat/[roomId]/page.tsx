'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ArrowLeft, MessageCircle } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/chatStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import type { ChatRoom, Message } from '@/store/chatStore';

const TIMESTAMP_INTERVAL = 10; // show timestamp every N messages
const TYPING_GAP_MINUTES = 5; // show timestamp if gap > N minutes

function shouldShowTimestamp(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  if ((index + 1) % TIMESTAMP_INTERVAL === 0) return true;
  const prev = messages[index - 1];
  const curr = messages[index];
  return differenceInMinutes(new Date(curr.createdAt), new Date(prev.createdAt)) >= TYPING_GAP_MINUTES;
}

function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;
  const label =
    users.length === 1
      ? `${users[0]} is typing`
      : `${users.slice(0, 2).join(', ')} are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-2 px-4 pb-2"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-text-muted"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">{label}…</span>
    </motion.div>
  );
}

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();

  const { messages, sendMessage, isLoading, isSending, hasMore, loadMore, typingUsers, sendTypingIndicator } =
    useChat(roomId);
  const { rooms } = useChatStore();

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // ── Load room details ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRoom = async () => {
      // First check store
      const storeRoom = rooms.find((r) => r._id === roomId);
      if (storeRoom) {
        setRoom(storeRoom);
        setMemberCount(storeRoom.members.length);
        setIsLoadingRoom(false);
        return;
      }
      // Fallback: fetch from API
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}`);
        if (!res.ok) {
          router.replace('/chat');
          return;
        }
        const data = await res.json();
        setRoom(data.room);
        setMemberCount(data.room.members?.length ?? 0);
      } catch {
        router.replace('/chat');
      } finally {
        setIsLoadingRoom(false);
      }
    };
    if (roomId) fetchRoom();
  }, [roomId, rooms, router]);

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // ── Initial scroll to bottom ───────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [isLoading]);

  // ── Scroll detection ───────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);

    // Trigger load more when near top
    if (el.scrollTop < 100 && hasMore && !isLoading) {
      const prevHeight = el.scrollHeight;
      loadMore().then(() => {
        // Maintain scroll position after prepend
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      });
    }
  }, [hasMore, isLoading, loadMore]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const myId = (session?.user as any)?.id;

  if (status === 'loading' || isLoadingRoom) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-marigold" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-bg-primary">
      {/* Header */}
      <ChatHeader room={room} memberCount={memberCount} showBack />

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-1 scroll-smooth"
      >
        {/* Load more indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-accent-marigold" />
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-secondary py-12">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender._id === myId;
            const prevMsg = messages[i - 1];
            const showAvatar =
              !isOwn && (!prevMsg || prevMsg.sender._id !== msg.sender._id);
            const showTs = shouldShowTimestamp(messages, i);

            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={isOwn}
                showTimestamp={showTs}
                showAvatar={showAvatar}
              />
            );
          })
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom FAB */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 z-20 w-10 h-10 rounded-full bg-accent-marigold text-bg-primary shadow-marigold flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={sendTypingIndicator}
        isSending={isSending}
      />
    </div>
  );
}
