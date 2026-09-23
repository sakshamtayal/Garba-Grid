'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Link, Image as ImageIcon, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Too short').max(120, 'Too long'),
  description: z.string().min(10, 'Too short').max(2000, 'Too long'),
  venue: z.string().min(3, 'Enter a venue'),
  date: z.string().min(1, 'Pick a date'),
  isFree: z.boolean(),
  price: z.string().optional(),
  bookingLink: z.string().url('Must be a valid URL'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddEventModal({ isOpen, onClose, onCreated }: AddEventModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isFree: true },
  });

  const isFree = watch('isFree');

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const price = values.isFree ? 'Free' : Number(values.price ?? 0);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          venue: values.venue,
          date: new Date(values.date).toISOString(),
          price,
          bookingLink: values.bookingLink,
          imageUrl: values.imageUrl || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Failed to create event');
      }
      toast.success('Event created! 🎪');
      reset();
      onCreated();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-bg-card border border-border-primary rounded-2xl shadow-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-primary">
              <h2 className="text-text-primary font-bold text-xl">Add New Event 🎪</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">Event Title *</label>
                <input
                  {...register('title')}
                  placeholder="Navratri Night 2026..."
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">Description *</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Tell students what to expect..."
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors resize-none"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              {/* Venue */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">
                  <MapPin className="w-3 h-3 inline mr-1" /> Venue *
                </label>
                <input
                  {...register('venue')}
                  placeholder="Talkatora Indoor Stadium, New Delhi"
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                />
                {errors.venue && <p className="text-red-400 text-xs mt-1">{errors.venue.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">
                  <Calendar className="w-3 h-3 inline mr-1" /> Date & Time *
                </label>
                <input
                  {...register('date')}
                  type="datetime-local"
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-2 block">
                  <DollarSign className="w-3 h-3 inline mr-1" /> Price
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isFree')} className="accent-accent-marigold w-4 h-4" />
                    <span className="text-sm text-text-secondary">Free event</span>
                  </label>
                  {!isFree && (
                    <input
                      {...register('price')}
                      type="number"
                      min={0}
                      placeholder="Amount (Rs.)"
                      className="flex-1 bg-bg-secondary border border-border-primary rounded-xl px-4 py-2 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                    />
                  )}
                </div>
              </div>

              {/* Booking Link */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">
                  <Link className="w-3 h-3 inline mr-1" /> Booking Link *
                </label>
                <input
                  {...register('bookingLink')}
                  placeholder="https://insider.in/..."
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                />
                {errors.bookingLink && <p className="text-red-400 text-xs mt-1">{errors.bookingLink.message}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1 block">
                  <ImageIcon className="w-3 h-3 inline mr-1" /> Banner Image URL (optional)
                </label>
                <input
                  {...register('imageUrl')}
                  placeholder="https://images.example.com/banner.jpg"
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                />
                {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>}
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-festival text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Event 🎪'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
