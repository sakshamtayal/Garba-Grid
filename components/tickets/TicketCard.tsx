'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, MapPin, Phone, MessageSquare, CheckCircle, Tag, Clock } from 'lucide-react';
import { Ticket } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange?: (id: string, newStatus: 'available' | 'sold' | 'reserved') => void;
  isOwner?: boolean;
}

export default function TicketCard({ ticket, isOwner, onStatusChange }: TicketCardProps) {
  const [showContact, setShowContact] = useState(false);

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'available':
        return <Badge variant="status" status="available" label="Available" />;
      case 'reserved':
        return <Badge variant="status" status="reserved" label="Reserved" />;
      case 'sold':
        return <Badge variant="status" status="sold" label="Sold Out" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-bg-card border border-border-primary hover:border-accent-marigold/50 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group"
    >
      {/* Decorative Ticket Notch */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-primary rounded-full border-r border-border-primary" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-primary rounded-full border-l border-border-primary" />

      <div>
        {/* Header: Event and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent-marigold/10 border border-accent-marigold/20 flex items-center justify-center text-accent-marigold">
              <TicketIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base leading-tight group-hover:text-accent-marigold transition-colors">
                {ticket.eventName}
              </h3>
              <span className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <Clock size={12} />
                {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : 'Just now'}
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Pricing and Quantity */}
        <div className="mt-4 flex items-baseline justify-between bg-bg-secondary/60 rounded-xl p-3 border border-border-accent/40">
          <div>
            <span className="text-xs text-text-muted">Asking Price</span>
            <div className="text-xl font-black text-accent-marigold">
              ₹{ticket.price}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-text-muted">Quantity</span>
            <div className="text-sm font-bold text-text-primary flex items-center gap-1 justify-end">
              <Tag size={12} className="text-accent-gold" />
              {ticket.quantity} {ticket.quantity === 1 ? 'Pass' : 'Passes'}
            </div>
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <p className="mt-3 text-sm text-text-secondary leading-relaxed bg-bg-tertiary/40 rounded-lg p-2.5 border border-border-primary/50 text-xs">
            {ticket.description}
          </p>
        )}

        {/* Seller Info */}
        {(() => {
          const sellerObj = typeof ticket.seller === 'object' && ticket.seller !== null ? ticket.seller : null;
          const sellerName = sellerObj?.name || 'Student';
          const sellerCollege = sellerObj?.college;
          return (
            <div className="mt-4 pt-3 border-t border-border-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-pink/20 text-accent-pink font-bold text-xs flex items-center justify-center">
                  {sellerName[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{sellerName}</p>
                  {sellerCollege && (
                    <span className="text-[10px] text-accent-gold font-medium">{sellerCollege}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Action / Contact section */}
      <div className="mt-4 pt-2">
        {isOwner ? (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange?.(ticket._id, ticket.status === 'sold' ? 'available' : 'sold')}
              className="w-full py-2 px-3 rounded-xl bg-bg-secondary border border-border-primary hover:border-accent-marigold text-xs font-semibold text-text-primary transition-all"
            >
              {ticket.status === 'sold' ? 'Mark Available' : 'Mark as Sold'}
            </button>
          </div>
        ) : (
          <div>
            {showContact ? (
              <div className="p-3 bg-accent-marigold/10 border border-accent-marigold/30 rounded-xl text-center">
                <p className="text-xs text-text-muted">Contact Info / WhatsApp:</p>
                <p className="text-sm font-bold text-accent-marigold mt-0.5 select-all">
                  {ticket.contactInfo || 'Contact via GarbaGrid DM'}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowContact(true)}
                disabled={ticket.status === 'sold'}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-marigold text-white font-semibold text-xs shadow-marigold hover:shadow-marigold-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Phone size={14} />
                <span>Contact Seller</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
