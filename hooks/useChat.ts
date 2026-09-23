'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useChatStore, Message } from '@/store/chatStore';
import { usePusher } from './usePusher';
import { v4 as uuidv4 } from 'uuid';

interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string, type?: 'text' | 'image') => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  typingUsers: string[];
  sendTypingIndicator: () => void;
}

export function useChat(roomId: string): UseChatReturn {
  const { data: session } = useSession();
  const {
    messages: allMessages,
    setMessages,
    addMessage,
    replaceOptimisticMessage,
    prependMessages,
    incrementUnread,
    clearUnread,
    activeRoomId,
    setTyping,
    typingUsers: allTypingUsers,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messages = allMessages[roomId] ?? [];
  const typingUsers = allTypingUsers[roomId] ?? [];

  // ── Initial message load ───────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(roomId, data.messages);
        setCursor(data.nextCursor ?? null);
        setHasMore(!!data.nextCursor);
        clearUnread(roomId);
      } catch (err) {
        console.error('useChat load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // Mark room as read
    fetch(`/api/chat/rooms/${roomId}/mark-read`, { method: 'POST' }).catch(() => {});
  }, [roomId]);

  // ── Pusher: real-time new messages ─────────────────────────────────────────
  usePusher(`room-${roomId}`, 'new-message', (data: Message) => {
    // Ignore own messages (already added optimistically)
    if (data.sender._id === (session?.user as any)?._id) return;
    addMessage(roomId, data);
    if (activeRoomId !== roomId) {
      incrementUnread(roomId);
    } else {
      fetch(`/api/chat/rooms/${roomId}/mark-read`, { method: 'POST' }).catch(() => {});
    }
  });

  // ── Pusher: typing indicators ──────────────────────────────────────────────
  usePusher(`room-${roomId}`, 'typing', (data: { username: string; isTyping: boolean }) => {
    if (data.username === (session?.user as any)?.username) return;
    setTyping(roomId, data.username, data.isTyping);
    if (data.isTyping) {
      setTimeout(() => setTyping(roomId, data.username, false), 5000);
    }
  });

  // ── Load older messages (pagination) ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !cursor) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/chat/rooms/${roomId}/messages?cursor=${cursor}`
      );
      if (!res.ok) throw new Error('Failed to load more');
      const data = await res.json();
      prependMessages(roomId, data.messages);
      setCursor(data.nextCursor ?? null);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('useChat loadMore error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, cursor, roomId]);

  // ── Send a message (optimistic) ────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, type: 'text' | 'image' = 'text') => {
      if (!content.trim() || isSending || !session?.user) return;

      const user = session.user as any;
      const tempId = `optimistic-${uuidv4()}`;

      const optimistic: Message = {
        _id: tempId,
        roomId,
        sender: {
          _id: user._id ?? '',
          username: user.username ?? '',
          name: user.name ?? '',
          profilePicture: user.profilePicture,
          college: user.college ?? '',
        },
        content,
        type,
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      addMessage(roomId, optimistic);
      setIsSending(true);

      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, type }),
        });

        if (!res.ok) throw new Error('Send failed');
        const { message } = await res.json();
        replaceOptimisticMessage(roomId, tempId, message);
      } catch (err) {
        console.error('sendMessage error:', err);
        // Remove optimistic message on failure
        const current = useChatStore.getState().messages[roomId] ?? [];
        useChatStore
          .getState()
          .setMessages(roomId, current.filter((m) => m._id !== tempId));
      } finally {
        setIsSending(false);
      }
    },
    [isSending, session, roomId]
  );

  // ── Typing indicator (debounced) ───────────────────────────────────────────
  const sendTypingIndicator = useCallback(() => {
    if (!session?.user) return;

    fetch(`/api/chat/rooms/${roomId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTyping: true }),
    }).catch(() => {});

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      fetch(`/api/chat/rooms/${roomId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping: false }),
      }).catch(() => {});
    }, 3000);
  }, [session, roomId]);

  return {
    messages,
    sendMessage,
    isLoading,
    isSending,
    hasMore,
    loadMore,
    typingUsers,
    sendTypingIndicator,
  };
}
