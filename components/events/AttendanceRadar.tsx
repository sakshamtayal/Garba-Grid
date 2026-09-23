'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { College, COLLEGE_COLORS, COLLEGES } from '@/types';

interface AttendanceRadarProps {
  eventTitle: string;
  eventId: string;
  collegeBreakdown: Partial<Record<College, number>>;
  totalAttendees: number;
  userAttending: boolean;
  userCollege?: College;
}

export function AttendanceRadar({
  eventTitle,
  collegeBreakdown,
  totalAttendees,
  userAttending,
  userCollege,
}: AttendanceRadarProps) {
  const maxCount = Math.max(1, ...Object.values(collegeBreakdown).filter(Boolean) as number[]);

  const rows = COLLEGES.map((college) => ({
    college,
    count: collegeBreakdown[college] ?? 0,
    color: COLLEGE_COLORS[college] ?? COLLEGE_COLORS.Other,
    pct: ((collegeBreakdown[college] ?? 0) / maxCount) * 100,
  })).filter((r) => r.count > 0);

  if (rows.length === 0) {
    return (
      <div className="bg-bg-card border border-border-primary rounded-2xl p-5 text-center">
        <p className="text-text-secondary text-sm">No attendees yet — be the first! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border-primary rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-text-primary text-sm line-clamp-1">{eventTitle}</h4>
          <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="font-bold text-accent-marigold">{totalAttendees}</span> attending
          </p>
        </div>
        {!userAttending && userCollege && (
          <span className="text-[10px] text-accent-pink font-medium border border-accent-pink/30 bg-accent-pink/10 rounded-full px-2 py-0.5 whitespace-nowrap">
            Join your crew!
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {rows.map(({ college, count, color, pct }, i) => (
          <div key={college} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium">{college}</span>
              <span className="font-bold" style={{ color }}>{count}</span>
            </div>
            <div className="relative h-2 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
