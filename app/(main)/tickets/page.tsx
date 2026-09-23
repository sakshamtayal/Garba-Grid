'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, Filter, Sparkles, Tag, Ticket as TicketIcon } from 'lucide-react';
import TicketCard from '@/components/tickets/TicketCard';
import ListTicketModal from '@/components/tickets/ListTicketModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import DandiayaLoader from '@/components/ui/DandiayaLoader';
import { Ticket } from '@/types';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('available');
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tickets', {
        params: { status: filter === 'all' ? undefined : filter },
      });
      setTickets(res.data.tickets || []);
    } catch {
      toast.error('Failed to load tickets feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'available' | 'sold' | 'reserved') => {
    try {
      await axios.patch(`/api/tickets/${id}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Pass status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const sellerCollege = typeof ticket.seller === 'object' && ticket.seller !== null ? ticket.seller.college : '';
    return (
      ticket.eventName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(search.toLowerCase()) ||
      sellerCollege.toLowerCase().includes(search.toLowerCase())
    );
  });

  const currentUserId = (session?.user as { id?: string })?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-bg-card via-bg-secondary to-bg-card p-6 rounded-3xl border border-border-primary shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-accent-marigold/5 blur-2xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-marigold/10 border border-accent-marigold/30 text-accent-marigold text-xs font-semibold mb-2">
            <Sparkles size={12} />
            <span>Extra Passes & Passes Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Extra Tickets Board 🎟️
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            Got an extra Dandiya pass or looking for last-minute entry? Trade, buy, or transfer tickets securely with verified college mates.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsListModalOpen(true)}
          className="shadow-marigold flex items-center gap-2 self-start sm:self-center flex-shrink-0"
        >
          <Plus size={18} />
          <span>List Extra Pass</span>
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by event or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-card border border-border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-marigold focus:ring-1 focus:ring-accent-marigold transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['available', 'all', 'sold'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === status
                  ? 'bg-accent-marigold text-white shadow-marigold'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card border border-border-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid / State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <DandiayaLoader size="lg" />
          <p className="text-text-muted text-sm">Searching for spare passes...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No passes listed yet"
          description="Be the first to list a spare pass or check back soon as festival dates draw closer!"
          actionLabel="List a Pass"
          onAction={() => setIsListModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((ticket) => {
            const sellerId = typeof ticket.seller === 'object' && ticket.seller !== null ? ticket.seller._id : ticket.seller;
            return (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                isOwner={sellerId === currentUserId}
                onStatusChange={handleStatusChange}
              />
            );
          })}
        </div>
      )}

      {/* List Modal */}
      <ListTicketModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
