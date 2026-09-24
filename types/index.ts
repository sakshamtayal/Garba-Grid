import { Document, Types } from 'mongoose';

// ─── Enums / Literals ──────────────────────────────────────────────────────────

export type DandiayaSkillLevel =
  | 'professional'
  | 'chaos_merchant'
  | 'left_right_struggler';

export type College =
  | 'DTU'
  | 'NSUT'
  | 'IGDTUW'
  | 'NIT'
  | 'IIIT'
  | 'IIT Delhi'
  | 'DU'
  | 'IPU'
  | 'Other'
  | (string & {});

export const COLLEGES: string[] = [
  'DTU',
  'NSUT',
  'IGDTUW',
  'NIT',
  'IIIT',
  'IIT Delhi',
  'DU',
  'IPU',
  'Other',
];

export const COLLEGE_COLORS: Record<string, string> = {
  DTU: '#3B82F6',
  NSUT: '#22C55E',
  IGDTUW: '#A855F7',
  NIT: '#06B6D4',
  IIIT: '#F97316',
  'IIT Delhi': '#EF4444',
  DU: '#8B5CF6',
  IPU: '#6366F1',
  Other: '#6B7280',
};

export const COLLEGE_BG_CLASSES: Record<string, string> = {
  DTU: 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold',
  NSUT: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold',
  IGDTUW: 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 font-semibold',
  NIT: 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-semibold',
  IIIT: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
  'IIT Delhi': 'bg-rose-100 text-rose-900 border border-rose-300 font-semibold',
  DU: 'bg-purple-100 text-purple-900 border border-purple-300 font-semibold',
  IPU: 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold',
  Other: 'bg-stone-100 text-stone-800 border border-stone-300 font-semibold',
};

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export type MatchStatus = 'pending' | 'connected' | 'passed';

export type ChatRoomType =
  | 'college_channel'
  | 'general'
  | 'gender_specific'
  | 'dm'
  | 'squad';

export type MessageType = 'text' | 'image';

export type TicketStatus = 'available' | 'sold' | 'reserved';

export type GenderFilter = 'all' | 'male' | 'female';

export type MemberRole = 'leader' | 'member';

export type AdminActionType =
  | 'ban_user'
  | 'unban_user'
  | 'approve_confession'
  | 'reject_confession'
  | 'delete_message'
  | 'feature_event'
  | 'resolve_report';

// ─── Plain Interfaces (for client-side / API responses) ───────────────────────

export type UserProfile = IUser;
export type User = IUser;
export type Event = IEvent;
export type Squad = ISquad;
export type Ticket = ITicket;
export type Confession = IConfession;
export type Match = IMatch;
export type Message = IMessage;
export type ChatRoom = IChatRoom;

export interface IUser {
  _id: string;
  username: string;
  password?: string;
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
  isVerified?: boolean;
  allowDirectDMs: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface IMatch {
  _id: string;
  from: string | IUser;
  to: string | IUser;
  status: MatchStatus;
  createdAt: Date;
  mutualConnectedAt?: Date;
}

export interface IMessage {
  _id: string;
  roomId: string | IChatRoom;
  sender: string | IUser;
  content: string;
  type: MessageType;
  readBy: string[];
  createdAt: Date;
}

export interface IChatRoom {
  _id: string;
  type: ChatRoomType;
  name: string;
  description: string;
  members: string[];
  isPrebuilt: boolean;
  college?: College;
  genderFilter: GenderFilter;
  createdAt: Date;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  venue: string;
  date: Date;
  price: number;
  bookingLink: string;
  imageUrl: string;
  ticketPlatform?: string;
  dateRange?: string;
  attendees: Array<{ userId: string; college: College }>;
  createdAt: Date;
  isActive: boolean;
}

export interface ISquad {
  _id: string;
  name: string;
  inviteCode: string;
  members: Array<{ userId: string | IUser; role: MemberRole }>;
  inviteLink: string;
  createdAt: Date;
}

export interface ITicket {
  _id: string;
  seller: string | IUser;
  event: string | IEvent;
  eventName: string;
  price: number;
  quantity: number;
  description: string;
  status: TicketStatus;
  contactInfo: string;
  createdAt: Date;
}

export interface IConfession {
  _id: string;
  author?: string | IUser;
  content: string;
  college?: College;
  isAnonymous: boolean;
  isApproved: boolean;
  reports: Array<{ userId: string; reason: string }>;
  likes: string[];
  createdAt: Date;
}

export interface IAdminAction {
  _id: string;
  admin: string | IUser;
  actionType: AdminActionType;
  targetUser?: string | IUser;
  targetContent?: string;
  reason: string;
  createdAt: Date;
}

// ─── Mongoose Document Types ───────────────────────────────────────────────────

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface IMatchDocument extends Omit<IMatch, '_id' | 'from' | 'to'>, Document {
  _id: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
}

export interface IMessageDocument
  extends Omit<IMessage, '_id' | 'roomId' | 'sender' | 'readBy'>,
    Document {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  sender: Types.ObjectId;
  readBy: Types.ObjectId[];
}

export interface IChatRoomDocument
  extends Omit<IChatRoom, '_id' | 'members'>,
    Document {
  _id: Types.ObjectId;
  members: Types.ObjectId[];
}

export interface IEventDocument
  extends Omit<IEvent, '_id' | 'attendees'>,
    Document {
  _id: Types.ObjectId;
  attendees: Array<{ userId: Types.ObjectId; college: College }>;
  ticketPlatform?: string;
  dateRange?: string;
}

export interface ISquadDocument
  extends Omit<ISquad, '_id' | 'members'>,
    Document {
  _id: Types.ObjectId;
  members: Array<{ userId: Types.ObjectId; role: MemberRole }>;
}

export interface ITicketDocument
  extends Omit<ITicket, '_id' | 'seller' | 'event'>,
    Document {
  _id: Types.ObjectId;
  seller: Types.ObjectId;
  event: Types.ObjectId;
}

export interface IConfessionDocument
  extends Omit<IConfession, '_id' | 'author' | 'reports' | 'likes'>,
    Document {
  _id: Types.ObjectId;
  author?: Types.ObjectId;
  reports: Array<{ userId: Types.ObjectId; reason: string }>;
  likes: Types.ObjectId[];
}

export interface IAdminActionDocument
  extends Omit<IAdminAction, '_id' | 'admin' | 'targetUser'>,
    Document {
  _id: Types.ObjectId;
  admin: Types.ObjectId;
  targetUser?: Types.ObjectId;
}

// ─── Session / Auth Types ─────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
  profilePicture: string;
  college: College;
  gender: Gender;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── UI / Store Types ─────────────────────────────────────────────────────────

export type ModalType =
  | 'creator_profile'
  | 'confirm_delete'
  | 'image_preview'
  | 'invite_squad'
  | 'report_content'
  | null;

export interface NotificationCounts {
  unreadMessages: number;
  pendingConnections: number;
}
