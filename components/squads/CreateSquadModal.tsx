'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { InviteLinkCard } from './InviteLinkCard';
import { ISquad } from '@/types';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 chars').max(60, 'Too long'),
});

type FormValues = z.infer<typeof schema>;

interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (squad: ISquad) => void;
}

export function CreateSquadModal({ isOpen, onClose, onCreated }: CreateSquadModalProps) {
  const [loading, setLoading] = useState(false);
  const [createdSquad, setCreatedSquad] = useState<ISquad | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message ?? 'Failed');
      }
      const { squad } = await res.json();
      setCreatedSquad(squad);
      onCreated(squad);
      reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedSquad(null);
    reset();
    onClose();
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="relative bg-bg-card border border-border-primary rounded-2xl shadow-card w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-primary">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-marigold" />
                <h2 className="text-text-primary font-bold text-xl">
                  {createdSquad ? 'Squad Created! 🎉' : 'Create a Squad'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-bg-hover flex items-center justify-center text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {createdSquad ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Celebration */}
                  <div className="text-center space-y-2">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                      className="text-5xl"
                    >
                      🎉
                    </motion.div>
                    <p className="text-text-secondary text-sm">
                      <span className="text-accent-marigold font-semibold">{createdSquad.name}</span> is ready! Share the invite link to build your crew.
                    </p>
                  </div>
                  <InviteLinkCard squad={createdSquad} />
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-primary transition-colors text-sm font-medium"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-xs text-text-secondary font-medium mb-1.5 block">Squad Name *</label>
                    <input
                      {...register('name')}
                      placeholder="DTU Dandiya Warriors 💃"
                      className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-marigold transition-colors"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent-gold" />
                    A unique invite code will be generated for you
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-festival text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Squad 🎊'
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
