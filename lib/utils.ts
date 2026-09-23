import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import imageCompression from 'browser-image-compression';
import type { College } from '@/types';

// ─── Tailwind class merging ───────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * Format a date as a human-readable string.
 * e.g. "Sep 19, 2026" or "19 September 2026"
 */
export function formatDate(date: Date | string, pattern = 'dd MMM yyyy'): string {
  return format(new Date(date), pattern);
}

/**
 * Format a date relative to now with smart labels for today/yesterday.
 * e.g. "just now", "5 min ago", "Yesterday", "Sep 15"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  if (diffMs < 7 * 24 * 60 * 60 * 1000) return format(d, 'EEEE'); // Day name
  return format(d, 'dd MMM');
}

/**
 * Full relative distance, e.g. "3 hours ago", "2 days ago"
 */
export function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── String utilities ─────────────────────────────────────────────────────────

/**
 * Truncate a string to a max length with an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '…';
}

/**
 * Get initials from a full name (up to 2 characters).
 * e.g. "Saksham Tayal" → "ST"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Invite code generation ───────────────────────────────────────────────────

/**
 * Generate a random alphanumeric invite code.
 * e.g. "GG-X4KP9W"
 */
export function generateInviteCode(prefix = 'GG'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars O/0/I/1
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${prefix}-${code}`;
}

// ─── Image compression ────────────────────────────────────────────────────────

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Compress an image File/Blob using browser-image-compression.
 * Returns a compressed File suitable for upload.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const opts = {
    maxSizeMB: options.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1080,
    useWebWorker: options.useWebWorker ?? true,
    fileType: file.type as string,
  };

  const compressed = await imageCompression(file, opts);

  // Preserve original file name
  return new File([compressed], file.name, { type: compressed.type });
}

/**
 * Convert a File to a base64 data URL.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── College color mapping ────────────────────────────────────────────────────

const COLLEGE_COLORS: Record<College, { bg: string; text: string; border: string }> = {
  DTU: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  NSUT: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  IGDTUW: { bg: '#fae8ff', text: '#86198f', border: '#f0abfc' },
  IIIT: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  'IIT Delhi': { bg: '#ffe4e6', text: '#be123c', border: '#fda4af' },
  Other: { bg: '#f5f5f4', text: '#44403c', border: '#d6d3d1' },
};

export function getCollegeColor(college: College) {
  return COLLEGE_COLORS[college] ?? COLLEGE_COLORS.Other;
}

/**
 * Returns a Tailwind-compatible inline style for college badge.
 */
export function getCollegeBadgeStyle(college: College): React.CSSProperties {
  const colors = getCollegeColor(college);
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    borderColor: colors.border,
  };
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,30}$/.test(username);
}

export function isValidInstagramId(id: string): boolean {
  return /^[a-zA-Z0-9._]{1,30}$/.test(id);
}

// ─── Number formatting ────────────────────────────────────────────────────────

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

export function buildInviteLink(inviteCode: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base}/join/${inviteCode}`;
}
