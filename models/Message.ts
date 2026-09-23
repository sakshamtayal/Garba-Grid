import mongoose, { Schema } from 'mongoose';
import { IMessageDocument, MessageType } from '@/types';

const MessageSchema = new Schema<IMessageDocument>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: [true, 'Room ID is required'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image'] as MessageType[],
      default: 'text',
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Index for fast room message retrieval (most recent first)
MessageSchema.index({ roomId: 1, createdAt: -1 });
// Index for unread count queries
MessageSchema.index({ roomId: 1, readBy: 1 });

const Message =
  (mongoose.models.Message as mongoose.Model<IMessageDocument>) ||
  mongoose.model<IMessageDocument>('Message', MessageSchema);

export { Message };
export default Message;
