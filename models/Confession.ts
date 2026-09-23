import mongoose, { Schema } from 'mongoose';
import { IConfessionDocument, College } from '@/types';

const ConfessionSchema = new Schema<IConfessionDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Confession content is required'],
      minlength: [10, 'Confession must be at least 10 characters'],
      maxlength: [1000, 'Confession cannot exceed 1000 characters'],
      trim: true,
    },
    college: {
      type: String,
      enum: ['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other', null] as (College | null)[],
      required: false,
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    reports: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reason: {
          type: String,
          required: true,
          maxlength: [200, 'Report reason cannot exceed 200 characters'],
        },
      },
    ],
    likes: [
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
        if (ret.isAnonymous) {
          delete ret.author;
        }
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

ConfessionSchema.index({ isApproved: 1, createdAt: -1 });
ConfessionSchema.index({ college: 1, isApproved: 1 });

const Confession =
  (mongoose.models.Confession as mongoose.Model<IConfessionDocument>) ||
  mongoose.model<IConfessionDocument>('Confession', ConfessionSchema);

export { Confession };
export default Confession;
