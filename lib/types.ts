// ─── Core Domain Types ────────────────────────────────────────────────────────

export type College =
  | 'DTU'
  | 'NSUT'
  | 'IGDTUW'
  | 'IIIT'
  | 'IIT Delhi'
  | 'Other';

export type DandiayaSkillLevel =
  | 'professional'
  | 'chaos_merchant'
  | 'left_right_struggler';

export type Gender =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'prefer_not_to_say';

export type MatchStatus = 'pending' | 'connected' | 'passed';

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  username: string;
  name: string;
  gender: Gender;
  college: College;
  age?: number;
  instagramId?: string;
  bio: string;
  profilePicture?: string;
  hobbies: string[];
  dandiayaSkillLevel: DandiayaSkillLevel;
  isAdmin: boolean;
  allowDirectDMs: boolean;
  createdAt: string;
}

// ─── Match ────────────────────────────────────────────────────────────────────

export interface Match {
  _id: string;
  fromUser: string | UserProfile;
  toUser: string | UserProfile;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Discover Queue ───────────────────────────────────────────────────────────

export interface DiscoverAction {
  toUserId: string;
  action: 'connect' | 'pass';
}

export interface MutualMatch {
  matched: boolean;
  user?: UserProfile;
}

// ─── College Metadata ─────────────────────────────────────────────────────────

export const COLLEGE_COLORS: Record<College, string> = {
  DTU: 'bg-sky-100 text-sky-900 border-sky-300 font-semibold',
  NSUT: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
  IGDTUW: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 font-semibold',
  IIIT: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
  'IIT Delhi': 'bg-rose-100 text-rose-900 border-rose-300 font-semibold',
  Other: 'bg-stone-100 text-stone-800 border-stone-300 font-semibold',
};

export const SKILL_META: Record<
  DandiayaSkillLevel,
  { emoji: string; label: string; color: string }
> = {
  professional: {
    emoji: '🥁',
    label: 'Professional',
    color: 'bg-amber-100/90 text-amber-900 border-accent-gold/60 font-semibold',
  },
  chaos_merchant: {
    emoji: '🌀',
    label: 'Chaos Merchant',
    color: 'bg-pink-100/90 text-pink-900 border-accent-pink/60 font-semibold',
  },
  left_right_struggler: {
    emoji: '👟',
    label: 'Left/Right Foot Struggler',
    color: 'bg-bg-secondary text-text-secondary border-border-primary font-medium',
  },
};

export const COLLEGES: College[] = [
  'DTU',
  'NSUT',
  'IGDTUW',
  'IIIT',
  'IIT Delhi',
  'Other',
];
