'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Confession, College } from '@/types';
import { ShieldCheck, Sparkles } from 'lucide-react';

const confessionSchema = z.object({
  content: z.string().min(10, 'Confession must be at least 10 characters').max(500, 'Max 500 characters'),
  college: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

type ConfessionFormData = z.infer<typeof confessionSchema>;

interface PostConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfessionPosted?: (confession: Confession) => void;
}

const COLLEGES: (College | 'Delhi-NCR Wide')[] = [
  'Delhi-NCR Wide',
  'DTU',
  'NSUT',
  'IGDTUW',
  'NIT',
  'IIIT',
  'IIT Delhi',
  'DU',
  'Other',
];

export default function PostConfessionModal({ isOpen, onClose, onConfessionPosted }: PostConfessionModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfessionFormData>({
    resolver: zodResolver(confessionSchema),
    defaultValues: {
      content: '',
      college: 'Delhi-NCR Wide',
      isAnonymous: true,
    },
  });

  const contentValue = watch('content') || '';

  const onSubmit = async (data: ConfessionFormData) => {
    try {
      setLoading(true);
      const payload = {
        content: data.content,
        college: data.college === 'Delhi-NCR Wide' ? undefined : data.college,
        isAnonymous: true,
      };
      const res = await axios.post('/api/confessions', payload);
      toast.success('Confession submitted for moderation! 🤫✨', {
        duration: 4000,
      });
      reset();
      onClose();
      if (onConfessionPosted && res.data.confession) {
        onConfessionPosted(res.data.confession);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to post confession' : 'Failed to post confession';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Anonymous Confession 🤫">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="p-3 bg-bg-secondary border border-border-primary rounded-xl flex items-center gap-2.5 text-xs text-text-secondary">
          <ShieldCheck size={16} className="text-status-online flex-shrink-0" />
          <span>Your identity is 100% anonymized. No names, IDs, or links are attached.</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Festival Confession / Shout-out
            </label>
            <span className={`text-[11px] ${contentValue.length > 450 ? 'text-accent-marigold' : 'text-text-muted'}`}>
              {contentValue.length}/500
            </span>
          </div>
          <textarea
            {...register('content')}
            rows={4}
            placeholder="e.g. Saw someone with the most insane Garba twirls at DTU OAT yesterday... who were you? 💃"
            className="w-full bg-bg-secondary border border-border-primary focus:border-accent-pink focus:ring-1 focus:ring-accent-pink rounded-xl p-3.5 text-text-primary text-sm placeholder-text-muted resize-none transition-colors"
          />
          {errors.content && (
            <p className="text-xs text-status-danger mt-1">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Target College / Circle
          </label>
          <select
            {...register('college')}
            className="w-full bg-bg-secondary border border-border-primary focus:border-accent-pink rounded-xl p-3 text-text-primary text-sm"
          >
            {COLLEGES.map((c) => (
              <option key={c} value={c} className="bg-bg-secondary">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" loading={loading} className="bg-gradient-pink">
            <Sparkles size={14} className="mr-1.5" />
            Drop Confession 🤫
          </Button>
        </div>
      </form>
    </Modal>
  );
}
