'use client';

import { cn } from '@/lib/utils';

// ─── Base skeleton ────────────────────────────────────────────────────────────

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} />;
}

// ─── Profile card skeleton (for Discover feed) ────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-bg-card border border-border-primary rounded-2xl p-5 flex flex-col gap-4',
        className
      )}
    >
      {/* Profile picture */}
      <Bone className="w-full aspect-[3/4] rounded-xl" />
      {/* Name + college row */}
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-32" />
        <Bone className="h-5 w-16 rounded-md" />
      </div>
      {/* Bio line */}
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-4/5" />
      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <Bone className="h-10 flex-1 rounded-xl" />
        <Bone className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Chat message list skeleton ───────────────────────────────────────────────

export function SkeletonList({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 p-4', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const isRight = i % 3 === 2;
        return (
          <div
            key={i}
            className={cn('flex items-end gap-2', isRight && 'flex-row-reverse')}
          >
            {/* Avatar */}
            <Bone className="h-8 w-8 rounded-full shrink-0" />
            {/* Bubble */}
            <div className="flex flex-col gap-1 max-w-[60%]">
              <Bone className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-32')} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Full profile page skeleton ───────────────────────────────────────────────

export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6 p-5', className)}>
      {/* Header: avatar + name + college */}
      <div className="flex flex-col items-center gap-3">
        <Bone className="h-28 w-28 rounded-full" />
        <Bone className="h-6 w-40" />
        <Bone className="h-4 w-24 rounded-md" />
      </div>
      {/* Bio */}
      <div className="flex flex-col gap-2">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
        <Bone className="h-3 w-3/4" />
      </div>
      {/* Hobbies */}
      <div className="flex flex-wrap gap-2">
        {[80, 60, 100, 70, 90].map((w, i) => (
          <Bone key={i} className={`h-6 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Bone className="h-6 w-10" />
            <Bone className="h-3 w-14" />
          </div>
        ))}
      </div>
      {/* Action buttons */}
      <div className="flex gap-3">
        <Bone className="h-11 flex-1 rounded-xl" />
        <Bone className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Event card skeleton ──────────────────────────────────────────────────────

export function SkeletonEvent({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-bg-card border border-border-primary rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Banner image */}
      <Bone className="w-full h-40" />
      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <Bone className="h-5 w-3/4" />
        {/* Date + venue row */}
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-4 rounded" />
          <Bone className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-4 rounded" />
          <Bone className="h-3 w-44" />
        </div>
        {/* Price + button */}
        <div className="flex items-center justify-between mt-1">
          <Bone className="h-5 w-16" />
          <Bone className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Inline bone export for ad-hoc use ───────────────────────────────────────
export { Bone as SkeletonBone };
