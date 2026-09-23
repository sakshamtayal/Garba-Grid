'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Ticket } from '@/types';

const ticketSchema = z.object({
  eventName: z.string().min(3, 'Event name must be at least 3 characters'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').max(20, 'Max 20 passes per post'),
  description: z.string().optional(),
  contactInfo: z.string().min(5, 'Provide a valid WhatsApp number, IG, or contact details'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface ListTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated?: (ticket: Ticket) => void;
}

export default function ListTicketModal({ isOpen, onClose, onTicketCreated }: ListTicketModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      eventName: '',
      price: 0,
      quantity: 1,
      description: '',
      contactInfo: '',
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/tickets', data);
      toast.success('Pass listed successfully! 🎟️');
      reset();
      onClose();
      if (onTicketCreated && res.data.ticket) {
        onTicketCreated(res.data.ticket);
      }
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to list pass.' : 'Failed to list pass.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List an Extra Dandiya Pass 🎟️">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Event / Night Name"
          placeholder="e.g. DTU Dandiya Night / JLN Stadium Mega Garba"
          error={errors.eventName?.message}
          {...register('eventName')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (₹ per pass)"
            type="number"
            placeholder="500"
            error={errors.price?.message}
            {...register('price')}
          />
          <Input
            label="Quantity Available"
            type="number"
            placeholder="1"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Note / Details (Optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="e.g. Couple pass, VIP entry, or can hand over physically at gate"
            className="w-full bg-bg-secondary border border-border-primary focus:border-accent-marigold focus:ring-1 focus:ring-accent-marigold rounded-xl p-3 text-text-primary text-sm placeholder-text-muted resize-none transition-colors"
          />
        </div>

        <Input
          label="Your WhatsApp / Contact Info"
          placeholder="e.g. WhatsApp: +91 9876543210 or @insta_handle"
          error={errors.contactInfo?.message}
          {...register('contactInfo')}
        />

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Post Listing 🚀
          </Button>
        </div>
      </form>
    </Modal>
  );
}
