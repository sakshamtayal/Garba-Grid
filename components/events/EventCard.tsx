'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ExternalLink, Users, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';
import { IEvent, College, COLLEGE_BG_CLASSES } from '@/types';

interface EventCardProps {
  event: IEvent;
  isAttending: boolean;
  isToggling: boolean;
  currentUserId?: string;
  onAttendToggle: (eventId: string) => void;
  index?: number;
}

const GRADIENT_FALLBACKS = [
  'from-accent-marigold/30 to-accent-pink/30',
  'from-accent-pink/30 to-accent-gold/30',
  'from-accent-gold/30 to-accent-marigold/30',
  'from-purple-500/30 to-accent-pink/30',
];

export function EventCard({
  event,
  isAttending,
  isToggling,
  onAttendToggle,
  index = 0,
}: EventCardProps) {
  const formattedDate = (() => {
    try {
      const d = typeof event.date === 'string' ? parseISO(event.date) : new Date(event.date);
      return format(d, "EEE, MMM d · h:mm a");
    } catch {
      return 'Date TBD';
    }
  })();

  const isFree = (event.price as unknown) === 'Free' || Number(event.price) === 0;
  const priceDisplay = isFree
    ? { label: 'Free', cls: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold' }
    : { label: `₹${event.price}`, cls: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' };

  const gradientClass = GRADIENT_FALLBACKS[index % GRADIENT_FALLBACKS.length];

  // Top 3 unique attendee colleges for avatars
  const collegeAvatars = Array.from(new Set(event.attendees.map((a) => a.college))).slice(0, 3);
  const overflowCount = Math.max(0, event.attendees.length - 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      className="group relative bg-bg-card border border-border-primary rounded-2xl overflow-hidden hover:border-accent-marigold/40 hover:shadow-card-hover transition-all duration-300"
    >
      {/* Festival border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-accent-marigold/5 to-accent-pink/5" />

      {/* Image / Banner */}
      <div className="relative h-44 w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={clsx('w-full h-full bg-gradient-to-br', gradientClass, 'flex items-center justify-center')}>
            <span className="text-5xl select-none">🎪</span>
          </div>
        )}
        {/* Price badge overlay */}
        <span className={clsx('absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm', priceDisplay.cls)}>
          {priceDisplay.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-text-primary font-semibold text-lg leading-tight line-clamp-2 group-hover:text-accent-marigold transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent-pink" />
          <span className="line-clamp-1">{event.venue}</span>
        </div>

        <div className="flex items-center gap-1.5 text-text-secondary text-sm">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-accent-marigold" />
          <span>{formattedDate}</span>
        </div>

        {/* Attendees */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {collegeAvatars.map((college) => (
              <div
                key={college}
                title={college}
                className={clsx(
                  'w-6 h-6 rounded-full border-2 border-bg-card flex items-center justify-center text-[9px] font-bold',
                  COLLEGE_BG_CLASSES[college as College] || COLLEGE_BG_CLASSES.Other
                )}
              >
                {college.slice(0, 1)}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="w-6 h-6 rounded-full border-2 border-bg-card bg-bg-secondary flex items-center justify-center text-[9px] text-text-secondary font-medium">
                +{overflowCount}
              </div>
            )}
          </div>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Users className="w-3 h-3" />
            {event.attendees.length} attending
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onAttendToggle(event._id)}
            disabled={isToggling}
            className={clsx(
              'flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5',
              isAttending
                ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                : 'bg-accent-marigold text-white hover:bg-accent-marigold-light active:bg-accent-marigold-dark',
              isToggling && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isToggling ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ...
              </span>
            ) : isAttending ? (
              <>
                <Check className="w-3.5 h-3.5" /> Going ✓
              </>
            ) : (
              "I'm Attending"
            )}
          </motion.button>

          <a
            href={event.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl border border-border-primary text-text-secondary hover:text-accent-marigold hover:border-accent-marigold/40 transition-colors duration-200 flex items-center"
            title="Book Now"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
