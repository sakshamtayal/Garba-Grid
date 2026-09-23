import mongoose, { Schema, Document, Model } from 'mongoose';

// ── ChatRoom ───────────────────────────────────────────────────────────────────
export type ChatRoomType = 'college_channel' | 'general' | 'gender_specific' | 'dm' | 'squad';

export interface IChatRoom extends Document {
  type: ChatRoomType;
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  isPrebuilt: boolean;
  college?: string;
  genderFilter: 'all' | 'male' | 'female';
  lastMessage?: mongoose.Types.ObjectId;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    type: {
      type: String,
      enum: ['college_channel', 'general', 'gender_specific', 'dm', 'squad'],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrebuilt: { type: Boolean, default: false },
    college: { type: String, trim: true },
    genderFilter: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ChatRoomSchema.index({ type: 1 });
ChatRoomSchema.index({ members: 1 });
ChatRoomSchema.index({ college: 1 });
ChatRoomSchema.index({ isPrebuilt: 1 });

export const ChatRoom: Model<IChatRoom> =
  mongoose.models.ChatRoom || mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);

// ── Message ────────────────────────────────────────────────────────────────────
export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image';
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: ['text', 'image'], default: 'text' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

// ── Confession ─────────────────────────────────────────────────────────────────
export interface IConfession extends Document {
  content: string;
  college?: string;
  isAnonymous: boolean;
  isApproved: boolean;
  submittedBy: mongoose.Types.ObjectId;
  reports: { userId: mongoose.Types.ObjectId; reason: string }[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConfessionSchema = new Schema<IConfession>(
  {
    content: { type: String, required: true, maxlength: 1000 },
    college: { type: String, trim: true },
    isAnonymous: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reports: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

ConfessionSchema.index({ isApproved: 1, createdAt: -1 });
ConfessionSchema.index({ college: 1 });

export const Confession: Model<IConfession> =
  mongoose.models.Confession || mongoose.model<IConfession>('Confession', ConfessionSchema);
