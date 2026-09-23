import mongoose, { Schema } from 'mongoose';
import { ISquadDocument, MemberRole } from '@/types';

const SquadSchema = new Schema<ISquadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Squad name is required'],
      trim: true,
      maxlength: [60, 'Squad name cannot exceed 60 characters'],
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['leader', 'member'] as MemberRole[],
          default: 'member',
        },
      },
    ],
    inviteLink: {
      type: String,
      default: '',
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

SquadSchema.index({ inviteCode: 1 }, { unique: true });
SquadSchema.index({ 'members.userId': 1 });

const Squad =
  (mongoose.models.Squad as mongoose.Model<ISquadDocument>) ||
  mongoose.model<ISquadDocument>('Squad', SquadSchema);

export { Squad };
export default Squad;
