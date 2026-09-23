import Pusher from 'pusher';
import PusherJS from 'pusher-js';

// ─── Server-side Pusher instance ──────────────────────────────────────────────
// Used in API routes to trigger events
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'garba_grid_pusher_app_id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'garba_grid_pusher_key',
  secret: process.env.PUSHER_SECRET || 'garba_grid_pusher_secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  useTLS: true,
});

// ─── Client-side Pusher instance (lazily initialized) ─────────────────────────
// Using a singleton pattern to avoid creating multiple connections
let pusherClientInstance: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (pusherClientInstance) {
    return pusherClientInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('getPusherClient() can only be called in the browser');
  }

  pusherClientInstance = new PusherJS(
    process.env.NEXT_PUBLIC_PUSHER_KEY || 'garba_grid_pusher_key',
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
      forceTLS: true,
      authEndpoint: '/api/pusher/auth',
    }
  );

  return pusherClientInstance;
}

/**
 * Disconnect and clear the Pusher client (useful on logout).
 */
export function disconnectPusherClient(): void {
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
  }
}

// ─── Channel name helpers ─────────────────────────────────────────────────────

export const pusherChannels = {
  /** Private DM channel for a chat room */
  room: (roomId: string) => `private-room-${roomId}`,
  /** Private presence channel for a user's notifications */
  userNotifications: (userId: string) => `private-user-${userId}`,
  /** Public channel for new confessions feed */
  confessions: 'confessions',
  /** Public channel for event updates */
  events: 'events',
} as const;

export const pusherEvents = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  USER_CONNECTED: 'user-connected',
  NEW_MATCH: 'new-match',
  NEW_CONFESSION: 'new-confession',
} as const;
