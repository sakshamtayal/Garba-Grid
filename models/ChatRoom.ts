import mongoose, { Schema } from 'mongoose';
import { IChatRoomDocument, ChatRoomType, College, GenderFilter } from '@/types';

const ChatRoomSchema = new Schema<IChatRoomDocument>(
  {
    type: {
      type: String,
      enum: [
        'college_channel',
        'general',
        'gender_specific',
        'dm',
        'squad',
      ] as ChatRoomType[],
      required: [true, 'Room type is required'],
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [80, 'Room name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPrebuilt: {
      type: Boolean,
      default: false,
    },
    college: {
      type: String,
      enum: ['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other', null] as (College | null)[],
      required: false,
      default: null,
    },
    genderFilter: {
      type: String,
      enum: ['all', 'male', 'female'] as GenderFilter[],
      default: 'all',
    },
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

ChatRoomSchema.index({ type: 1 });
ChatRoomSchema.index({ college: 1, type: 1 });
ChatRoomSchema.index({ members: 1 });

const ChatRoom =
  (mongoose.models.ChatRoom as mongoose.Model<IChatRoomDocument>) ||
  mongoose.model<IChatRoomDocument>('ChatRoom', ChatRoomSchema);

export { ChatRoom };
export default ChatRoom;
