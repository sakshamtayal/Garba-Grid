'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials, getCollegeColor } from '@/lib/utils';
import type { College } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type OnlineStatus = 'online' | 'away' | 'offline';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  status?: OnlineStatus;
  college?: College;
  className?: string;
  priority?: boolean;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string; statusOffset: string }> = {
  xs:  { container: 'h-6 w-6',   text: 'text-[9px]',  status: 'h-1.5 w-1.5', statusOffset: '-bottom-0 -right-0' },
  sm:  { container: 'h-8 w-8',   text: 'text-xs',     status: 'h-2 w-2',     statusOffset: '-bottom-0.5 -right-0.5' },
  md:  { container: 'h-10 w-10', text: 'text-sm',     status: 'h-2.5 w-2.5', statusOffset: 'bottom-0 right-0' },
  lg:  { container: 'h-12 w-12', text: 'text-base',   status: 'h-3 w-3',     statusOffset: 'bottom-0 right-0' },
  xl:  { container: 'h-16 w-16', text: 'text-lg',     status: 'h-3.5 w-3.5', statusOffset: 'bottom-0.5 right-0.5' },
  '2xl': { container: 'h-24 w-24', text: 'text-2xl',  status: 'h-4 w-4',     statusOffset: 'bottom-1 right-1' },
};

const statusColors: Record<OnlineStatus, string> = {
  online: 'bg-status-online',
  away: 'bg-status-away',
  offline: 'bg-status-offline',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  college,
  className,
  priority = false,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const dims = sizeMap[size];
  const initials = getInitials(name);

  const ringStyle = college
    ? { boxShadow: `0 0 0 2px ${getCollegeColor(college).border}` }
    : undefined;

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          dims.container,
          'rounded-full overflow-hidden',
          'bg-bg-secondary flex items-center justify-center',
          'select-none shrink-0'
        )}
        style={ringStyle}
      >
        {src && !imgError ? (
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 48px, 96px"
            onError={() => setImgError(true)}
            priority={priority}
          />
        ) : (
          <span
            className={cn(
              dims.text,
              'font-semibold bg-gradient-festival bg-clip-text text-transparent'
            )}
            aria-label={name}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Online status indicator dot */}
      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-bg-primary',
            dims.status,
            dims.statusOffset,
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

// ─── Avatar group (overlapping stack) ─────────────────────────────────────────

interface AvatarGroupProps {
  users: Array<{ src?: string; name: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const dims = sizeMap[size];

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <div
          key={i}
          className="-ml-2 first:ml-0 ring-2 ring-bg-primary rounded-full"
          style={{ zIndex: visible.length - i }}
        >
          <Avatar src={user.src} name={user.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            '-ml-2 ring-2 ring-bg-primary rounded-full',
            dims.container,
            'bg-bg-hover flex items-center justify-center',
            dims.text,
            'text-text-secondary font-medium'
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default Avatar;

