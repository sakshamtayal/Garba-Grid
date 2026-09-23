'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { EventCard } from '@/components/events/EventCard';
import { AttendanceRadar } from '@/components/events/AttendanceRadar';
import { AddEventModal } from '@/components/events/AddEventModal';
import { IEvent, College } from '@/types';
import useSWR, { mutate as globalMutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function SkeletonEvent() {
  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-bg-secondary" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-bg-secondary rounded-lg w-3/4" />
        <div className="h-4 bg-bg-secondary rounded-lg w-1/2" />
        <div className="h-4 bg-bg-secondary rounded-lg w-2/3" />
        <div className="h-8 bg-bg-secondary rounded-xl" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { data: session } = useSession();
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Map of eventId → toggling state
  const [togglingMap, setTogglingMap] = useState<Record<string, boolean>>({});
  // Optimistic attending set
  const [attendingSet, setAttendingSet] = useState<Set<string>>(new Set());
  // Per-event college breakdown cache
  const [breakdownCache, setBreakdownCache] = useState<
    Record<string, { total: number; breakdown: Partial<Record<College, number>> }>
  >({});

  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;
  const userCollege = (session?.user as { college?: string })?.college as College | undefined;

  const { data, isLoading } = useSWR<{ events: IEvent[] }>('/api/events', fetcher, {
    onSuccess(data) {
      // Determine initial attending set from loaded events
      if (userId) {
        const ids = new Set<string>();
        data.events.forEach((ev) => {
          if (ev.attendees.some((a) => a.userId === userId)) ids.add(ev._id);
        });
        setAttendingSet(ids);
      }
      // Build initial breakdown cache
      const cache: typeof breakdownCache = {};
      data.events.forEach((ev) => {
        const bd: Partial<Record<College, number>> = {};
        ev.attendees.forEach((a) => {
          bd[a.college] = (bd[a.college] ?? 0) + 1;
        });
        cache[ev._id] = { total: ev.attendees.length, breakdown: bd };
      });
      setBreakdownCache(cache);
    },
  });

  const events = data?.events ?? [];

  const handleAttendToggle = useCallback(
    async (eventId: string) => {
      if (!session) {
        toast.error('Please sign in first');
        return;
      }
      if (togglingMap[eventId]) return;

      // Optimistic update
      const wasAttending = attendingSet.has(eventId);
      setAttendingSet((prev) => {
        const next = new Set(prev);
        wasAttending ? next.delete(eventId) : next.add(eventId);
        return next;
      });
      setTogglingMap((prev) => ({ ...prev, [eventId]: true }));

      try {
        const res = await fetch(`/api/events/${eventId}/attend`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();

        setBreakdownCache((prev) => ({
          ...prev,
          [eventId]: { total: json.totalAttendees, breakdown: json.collegeBreakdown },
        }));
        // Sync attending state with server truth
        setAttendingSet((prev) => {
          const next = new Set(prev);
          json.isAttending ? next.add(eventId) : next.delete(eventId);
          return next;
        });
        toast.success(json.isAttending ? "You're attending! 🎉" : 'Removed from attendees');
      } catch {
        // Revert optimistic update
        setAttendingSet((prev) => {
          const next = new Set(prev);
          wasAttending ? next.add(eventId) : next.delete(eventId);
          return next;
        });
        toast.error('Something went wrong');
      } finally {
        setTogglingMap((prev) => ({ ...prev, [eventId]: false }));
      }
    },
    [session, togglingMap, attendingSet]
  );

  const eventsWithAttendees = events.filter(
    (e) => (breakdownCache[e._id]?.total ?? e.attendees.length) > 0
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Events Hub <span className="text-accent-marigold">🪔</span>
          </h1>
          <p className="text-text-secondary">Discover Navratri & Dandiya events near you</p>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonEvent key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-3"
          >
            <span className="text-6xl block">🎪</span>
            <p className="text-text-secondary text-lg">No events yet — check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => (
              <EventCard
                key={event._id}
                event={event}
                isAttending={attendingSet.has(event._id)}
                isToggling={!!togglingMap[event._id]}
                currentUserId={userId}
                onAttendToggle={handleAttendToggle}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Live Attendance Radar */}
        {eventsWithAttendees.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-marigold" />
              <h2 className="text-xl font-bold text-text-primary">
                Who's Going? <span>🎯</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsWithAttendees.map((event) => (
                <AttendanceRadar
                  key={event._id}
                  eventId={event._id}
                  eventTitle={event.title}
                  collegeBreakdown={breakdownCache[event._id]?.breakdown ?? {}}
                  totalAttendees={breakdownCache[event._id]?.total ?? event.attendees.length}
                  userAttending={attendingSet.has(event._id)}
                  userCollege={userCollege}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Admin FAB */}
      {isAdmin && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAddModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-festival rounded-full shadow-pink-lg flex items-center justify-center z-40"
          title="Add Event"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <AddEventModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={() => globalMutate('/api/events')}
      />
    </div>
  );
}
