'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Shield, ShieldOff, Ban, ExternalLink, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface AdminUser {
  _id: string;
  name: string;
  username: string;
  college: string;
  gender: string;
  profilePicture?: string;
  isAdmin: boolean;
  isDisabled: boolean;
  createdAt: string;
}

interface UserManagementTableProps {
  users: AdminUser[];
  currentUserId: string;
  onUpdate: () => void;
}

export function UserManagementTable({
  users: initial,
  currentUserId,
  onUpdate,
}: UserManagementTableProps) {
  const [users, setUsers] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAction = async (userId: string, action: 'toggle-admin' | 'toggle-disable') => {
    if (userId === currentUserId) {
      toast.error("You can't modify your own account");
      return;
    }
    setLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (!res.ok) throw new Error('Action failed');
      const { user: updated } = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updated } : u))
      );
      toast.success(
        action === 'toggle-admin'
          ? updated.isAdmin
            ? 'Admin role granted'
            : 'Admin role removed'
          : updated.isDisabled
          ? 'Account disabled'
          : 'Account enabled'
      );
      onUpdate();
    } catch {
      toast.error('Action failed. Try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.college.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users…"
          className="w-full bg-bg-card border border-border-primary rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-marigold/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border-primary rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border-primary text-text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left w-32">College</th>
              <th className="px-4 py-3 text-left w-24">Gender</th>
              <th className="px-4 py-3 text-left w-24">Joined</th>
              <th className="px-4 py-3 text-left w-24">Status</th>
              <th className="px-4 py-3 text-left w-28">Role</th>
              <th className="px-4 py-3 text-left w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={clsx(
                  'border-b border-border-primary last:border-0 transition-colors hover:bg-bg-hover',
                  user.isDisabled && 'opacity-60'
                )}
              >
                {/* User info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-accent-marigold/10 border border-border-primary">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent-marigold">
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{user.name}</p>
                      <p className="text-xs text-text-muted">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-hover text-text-secondary">
                    {user.college}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-text-secondary text-xs">{user.gender}</td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      user.isDisabled
                        ? 'bg-status-danger/15 text-status-danger'
                        : 'bg-status-online/15 text-status-online'
                    )}
                  >
                    {user.isDisabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      user.isAdmin
                        ? 'bg-accent-gold/15 text-accent-gold'
                        : 'bg-bg-hover text-text-muted'
                    )}
                  >
                    {user.isAdmin ? '👑 Admin' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {loadingId === user._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAction(user._id, 'toggle-admin')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-colors',
                          user.isAdmin
                            ? 'bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25'
                            : 'bg-bg-hover text-text-muted hover:text-accent-gold hover:bg-accent-gold/15'
                        )}
                        title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                      >
                        {user.isAdmin ? (
                          <ShieldOff className="w-3.5 h-3.5" />
                        ) : (
                          <Shield className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(user._id, 'toggle-disable')}
                        className={clsx(
                          'p-1.5 rounded-lg transition-colors',
                          user.isDisabled
                            ? 'bg-status-online/15 text-status-online hover:bg-status-online/25'
                            : 'bg-status-danger/15 text-status-danger hover:bg-status-danger/25'
                        )}
                        title={user.isDisabled ? 'Enable account' : 'Disable account'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/profile/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-bg-hover text-text-muted hover:text-accent-marigold hover:bg-accent-marigold/10 transition-colors"
                        title="View profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-text-secondary">
            <p className="text-sm">No users found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
