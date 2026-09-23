'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle, Trash2, Flag, GraduationCap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Confession {
  _id: string;
  content: string;
  college?: string;
  isAnonymous: boolean;
  isApproved: boolean;
  reports: { userId: string; reason: string }[];
  likes: string[];
  createdAt: string;
  submittedBy?: { name: string; username: string; college: string };
}

interface ConfessionModerationTableProps {
  confessions: Confession[];
  onUpdate: () => void;
}

export function ConfessionModerationTable({
  confessions: initial,
  onUpdate,
}: ConfessionModerationTableProps) {
  const [confessions, setConfessions] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Action failed');

      if (action === 'reject') {
        setConfessions((prev) => prev.filter((c) => c._id !== id));
        toast.success('Confession rejected & deleted');
      } else {
        setConfessions((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isApproved: true } : c))
        );
        toast.success('Confession approved');
      }
      onUpdate();
    } catch {
      toast.error('Action failed. Try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this confession permanently?')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setConfessions((prev) => prev.filter((c) => c._id !== id));
      toast.success('Confession deleted');
      onUpdate();
    } catch {
      toast.error('Delete failed');
    } finally {
      setLoadingId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} confessions?`)) return;
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => fetch(`/api/admin/confessions/${id}`, { method: 'DELETE' })));
    setConfessions((prev) => prev.filter((c) => !selectedIds.has(c._id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} confessions deleted`);
    onUpdate();
  };

  if (confessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
        <CheckCircle className="w-12 h-12 mb-3 text-status-online opacity-60" />
        <p className="font-medium text-text-primary">All clear!</p>
        <p className="text-sm mt-1">No confessions to moderate</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-2.5 bg-accent-marigold/10 border border-accent-marigold/20 rounded-xl"
          >
            <span className="text-sm text-accent-marigold font-medium">
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-xs text-status-danger hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete all
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-bg-card border border-border-primary rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-primary text-text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.size === confessions.length && confessions.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(confessions.map((c) => c._id)));
                    else setSelectedIds(new Set());
                  }}
                  className="accent-accent-marigold"
                />
              </th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-left w-28">College</th>
              <th className="px-4 py-3 text-left w-20">Reports</th>
              <th className="px-4 py-3 text-left w-28">Status</th>
              <th className="px-4 py-3 text-left w-24">Date</th>
              <th className="px-4 py-3 text-left w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {confessions.map((confession, i) => (
              <motion.tr
                key={confession._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={clsx(
                  'border-b border-border-primary last:border-0 transition-colors',
                  selectedIds.has(confession._id) ? 'bg-accent-marigold/5' : 'hover:bg-bg-hover'
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(confession._id)}
                    onChange={() => toggleSelect(confession._id)}
                    className="accent-accent-marigold"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="text-text-primary line-clamp-2">{confession.content}</p>
                  {confession.reports.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {confession.reports.slice(0, 2).map((r, ri) => (
                        <p key={ri} className="text-xs text-status-danger opacity-80">
                          ⚑ {r.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {confession.college ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-marigold/10 text-accent-marigold">
                      <GraduationCap className="w-3 h-3" />
                      {confession.college}
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {confession.reports.length > 0 ? (
                    <span className="flex items-center gap-1 text-status-danger font-medium">
                      <Flag className="w-3.5 h-3.5" />
                      {confession.reports.length}
                    </span>
                  ) : (
                    <span className="text-text-muted">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      confession.isApproved
                        ? 'bg-status-online/15 text-status-online'
                        : 'bg-status-away/15 text-status-away'
                    )}
                  >
                    {confession.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {format(new Date(confession.createdAt), 'MMM d')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {loadingId === confession._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                    ) : (
                      <>
                        {!confession.isApproved && (
                          <button
                            onClick={() => handleAction(confession._id, 'approve')}
                            className="p-1.5 rounded-lg bg-status-online/15 text-status-online hover:bg-status-online/25 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(confession._id)}
                          className="p-1.5 rounded-lg bg-status-danger/15 text-status-danger hover:bg-status-danger/25 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
