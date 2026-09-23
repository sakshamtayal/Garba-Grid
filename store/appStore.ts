import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AppState {
  currentUser: UserProfile | null;
  unreadCount: number;
  pendingConnectionsCount: number;
  isCreatorModalOpen: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
  setUnreadCount: (count: number) => void;
  setPendingConnectionsCount: (count: number) => void;
  setIsCreatorModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  unreadCount: 0,
  pendingConnectionsCount: 0,
  isCreatorModalOpen: false,
  setCurrentUser: (user) => set({ currentUser: user }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setPendingConnectionsCount: (count) => set({ pendingConnectionsCount: count }),
  setIsCreatorModalOpen: (isOpen) => set({ isCreatorModalOpen: isOpen }),
}));
