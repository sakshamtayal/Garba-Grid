import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────────────────────────────
export type ChatRoomType = 'college_channel' | 'general' | 'gender_specific' | 'dm' | 'squad';

export interface ChatRoom {
  _id: string;
  type: ChatRoomType;
  name: string;
  description?: string;
  members: string[];
  isPrebuilt: boolean;
  college?: string;
  genderFilter: 'all' | 'male' | 'female';
  lastActivity?: string;
  lastMessagePreview?: string;
}

export interface MessageSender {
  _id: string;
  username: string;
  name: string;
  profilePicture?: string;
  college: string;
}

export interface Message {
  _id: string;
  roomId: string;
  sender: MessageSender;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
  optimistic?: boolean;
}

// ── Store Interface ────────────────────────────────────────────────────────────
interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  typingUsers: Record<string, string[]>; // roomId -> usernames

  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  updateRoom: (roomId: string, update: Partial<ChatRoom>) => void;
  setActiveRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  replaceOptimisticMessage: (roomId: string, tempId: string, real: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  prependMessages: (roomId: string, messages: Message[]) => void;
  incrementUnread: (roomId: string) => void;
  clearUnread: (roomId: string) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (roomId: string, username: string, isTyping: boolean) => void;
  reset: () => void;
}

const initialState = {
  rooms: [],
  activeRoomId: null,
  messages: {},
  unreadCounts: {},
  isLoading: false,
  typingUsers: {},
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      ...initialState,

      setRooms: (rooms) => set({ rooms }),

      updateRoom: (roomId, update) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r._id === roomId ? { ...r, ...update } : r)),
        })),

      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      addMessage: (roomId, message) =>
        set((state) => {
          const existing = state.messages[roomId] ?? [];
          // Avoid duplicate optimistic messages
          if (existing.some((m) => m._id === message._id)) return state;
          return {
            messages: {
              ...state.messages,
              [roomId]: [...existing, message],
            },
          };
        }),

      replaceOptimisticMessage: (roomId, tempId, real) =>
        set((state) => {
          const existing = state.messages[roomId] ?? [];
          return {
            messages: {
              ...state.messages,
              [roomId]: existing.map((m) => (m._id === tempId ? real : m)),
            },
          };
        }),

      setMessages: (roomId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [roomId]: messages },
        })),

      prependMessages: (roomId, messages) =>
        set((state) => {
          const existing = state.messages[roomId] ?? [];
          const existingIds = new Set(existing.map((m) => m._id));
          const fresh = messages.filter((m) => !existingIds.has(m._id));
          return {
            messages: { ...state.messages, [roomId]: [...fresh, ...existing] },
          };
        }),

      incrementUnread: (roomId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [roomId]: (state.unreadCounts[roomId] ?? 0) + 1,
          },
        })),

      clearUnread: (roomId) =>
        set((state) => ({
          unreadCounts: { ...state.unreadCounts, [roomId]: 0 },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setTyping: (roomId, username, isTyping) =>
        set((state) => {
          const current = state.typingUsers[roomId] ?? [];
          const updated = isTyping
            ? current.includes(username)
              ? current
              : [...current, username]
            : current.filter((u) => u !== username);
          return { typingUsers: { ...state.typingUsers, [roomId]: updated } };
        }),

      reset: () => set(initialState),
    }),
    { name: 'chat-store' }
  )
);
