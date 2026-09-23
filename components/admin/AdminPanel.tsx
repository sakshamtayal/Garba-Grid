'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  AlertTriangle,
  Activity,
  BookHeart,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { ConfessionModerationTable } from './ConfessionModerationTable';
import { UserManagementTable } from './UserManagementTable';
import { format } from 'date-fns';

type Tab = 'overview' | 'confessions' | 'users';

interface Stats {
  users: { total: number; newToday: number; newThisWeek: number };
  messages: { total: number; last24h: number };
  confessions: { pending: number; approved: number; reported: number };
  rooms: { total: number };
  recentUsers: any[];
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border-primary rounded-2xl p-5 flex items-start gap-4"
    >
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-text-secondary mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'confessions', label: 'Confessions', icon: BookHeart },
  { id: 'users', label: 'Users', icon: Users },
] as const;

export function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [confessionStatus, setConfessionStatus] = useState<'pending' | 'approved' | 'reported'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const fetchConfessions = useCallback(async (status = confessionStatus) => {
    try {
      const res = await fetch(`/api/admin/confessions?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setConfessions(data.confessions);
      }
    } catch {}
  }, [confessionStatus]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchConfessions(), fetchUsers()]);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchConfessions(confessionStatus);
  }, [confessionStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchConfessions(), fetchUsers()]);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-marigold" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-bg-card border border-border-primary rounded-2xl p-3 sticky top-6">
          {/* Admin badge */}
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-accent-gold/10 border border-accent-gold/20">
            <span className="text-accent-gold text-lg">👑</span>
            <span className="text-sm font-semibold text-accent-gold">Admin Panel</span>
          </div>

          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  activeTab === id
                    ? 'bg-accent-marigold/15 text-accent-marigold border-l-2 border-accent-marigold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border-l-2 border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'confessions' && stats && stats.confessions.pending > 0 && (
                  <span className="ml-auto text-xs bg-accent-marigold text-bg-primary rounded-full px-1.5 py-0.5 font-bold">
                    {stats.confessions.pending}
                  </span>
                )}
                {activeTab === id && (
                  <ChevronRight className="w-3 h-3 ml-auto text-accent-marigold" />
                )}
              </button>
            ))}
          </nav>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            Refresh data
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* ── Overview Tab ────────────────────────────────────────────────── */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Dashboard Overview</h2>
              <span className="text-xs text-text-muted">Live data</span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Users"
                value={stats.users.total}
                sub={`+${stats.users.newToday} today`}
                icon={Users}
                color="bg-accent-marigold/15 text-accent-marigold"
              />
              <StatCard
                label="Total Messages"
                value={stats.messages.total}
                sub={`${stats.messages.last24h} in 24h`}
                icon={MessageSquare}
                color="bg-accent-pink/15 text-accent-pink"
              />
              <StatCard
                label="Pending Confessions"
                value={stats.confessions.pending}
                sub={`${stats.confessions.reported} reported`}
                icon={AlertTriangle}
                color="bg-status-away/15 text-status-away"
              />
              <StatCard
                label="Chat Rooms"
                value={stats.rooms.total}
                sub="Active channels"
                icon={Activity}
                color="bg-accent-gold/15 text-accent-gold"
              />
            </div>

            {/* Recent signups */}
            <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-marigold" />
                Recent Signups
              </h3>
              <div className="space-y-3">
                {stats.recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-marigold/15 flex items-center justify-center text-accent-marigold text-sm font-bold flex-shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {user.college} · @{user.username}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {format(new Date(user.createdAt), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Week stats */}
            <div className="bg-bg-card border border-border-primary rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-marigold" />
                This Week
              </h3>
              <p className="text-text-secondary text-sm">
                <span className="text-accent-marigold font-bold">{stats.users.newThisWeek}</span> new users joined this week
              </p>
            </div>
          </div>
        )}

        {/* ── Confessions Tab ──────────────────────────────────────────────── */}
        {activeTab === 'confessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">Confession Moderation</h2>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['pending', 'approved', 'reported'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setConfessionStatus(s)}
                  className={clsx(
                    'px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors',
                    confessionStatus === s
                      ? 'bg-accent-marigold text-bg-primary'
                      : 'bg-bg-card border border-border-primary text-text-secondary hover:border-accent-marigold/40'
                  )}
                >
                  {s}
                  {s === 'pending' && stats && stats.confessions.pending > 0 && (
                    <span className="ml-1.5 text-xs bg-bg-primary text-accent-marigold rounded-full px-1">
                      {stats.confessions.pending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <ConfessionModerationTable
              confessions={confessions}
              onUpdate={() => { fetchStats(); fetchConfessions(); }}
            />
          </div>
        )}

        {/* ── Users Tab ────────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">User Management</h2>
              <span className="text-sm text-text-muted">
                {stats?.users.total.toLocaleString()} total users
              </span>
            </div>
            <UserManagementTable
              users={users}
              currentUserId={currentUserId}
              onUpdate={() => { fetchStats(); fetchUsers(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
