'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Compass,
  MessageSquare,
  Calendar,
  Users,
  Ticket,
  MessageCircle,
  User,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';
import type { Session } from 'next-auth';
import Header from './Header';

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/squads', icon: Users, label: 'Squads' },
  { href: '/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/confessions', icon: MessageCircle, label: 'Confessions' },
  { href: '/profile', icon: User, label: 'Profile' },
];

// ─── AppShell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode;
  session: Session | null;
}

export default function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin;

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-primary fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border-primary">
          <span className="text-2xl">🪅</span>
          <span className="text-xl font-bold bg-gradient-festival bg-clip-text text-transparent">
            GarbaGrid
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ))}

          {isAdmin && (
            <NavLink
              href="/admin"
              icon={Shield}
              label="Admin"
              active={pathname.startsWith('/admin')}
              className="mt-4 border-t border-border-primary pt-4"
            />
          )}
        </nav>

        {/* User info */}
        {session?.user && (
          <div className="px-4 py-4 border-t border-border-primary">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-marigold flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                {(session.user as { profilePicture?: string }).profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(session.user as { profilePicture?: string }).profilePicture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  session.user.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-text-muted text-xs truncate">
                  @{(session.user as { username?: string }).username}
                </p>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border-primary">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                  active
                    ? 'text-accent-marigold'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={clsx(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
              pathname === '/profile' || pathname.startsWith('/profile/')
                ? 'text-accent-marigold'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  className,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        active
          ? 'bg-accent-marigold/10 text-accent-marigold border border-accent-marigold/20 shadow-sm'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        className,
      )}
    >
      <Icon size={18} className={active ? 'text-accent-marigold' : ''} />
      {label}
    </Link>
  );
}
