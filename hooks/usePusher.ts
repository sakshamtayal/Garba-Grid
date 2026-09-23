'use client';

import { useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';
import type { Channel } from 'pusher-js';

/**
 * Subscribe to a Pusher channel/event and invoke a callback on each event.
 * Automatically unsubscribes on unmount or when channelName/eventName changes.
 */
export function usePusher(
  channelName: string,
  eventName: string,
  callback: (data: any) => void
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!channelName || !eventName) return;

    const pusher = getPusherClient();
    const channel: Channel = pusher.subscribe(channelName);

    const handler = (data: any) => callbackRef.current(data);
    channel.bind(eventName, handler);

    // Handle reconnection: re-bind after connection restored
    const onConnected = () => {
      channel.bind(eventName, handler);
    };
    pusher.connection.bind('connected', onConnected);

    return () => {
      channel.unbind(eventName, handler);
      pusher.connection.unbind('connected', onConnected);
      // Only unsubscribe if no other bindings remain
      const channelObj = pusher.channel(channelName);
      if (channelObj && Object.keys(channelObj.callbacks._callbacks ?? {}).length === 0) {
        pusher.unsubscribe(channelName);
      }
    };
  }, [channelName, eventName]);
}
