import mongoose, { Schema } from 'mongoose';
import { IMatchDocument, MatchStatus } from '@/types';

const MatchSchema = new Schema<IMatchDocument>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'connected', 'passed'] as MatchStatus[],
      default: 'pending',
    },
    mutualConnectedAt: {
      type: Date,
      required: false,
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

// Compound index: each user pair can only have one match record
MatchSchema.index({ from: 1, to: 1 }, { unique: true });
// Index for quickly fetching all pending matches for a user
MatchSchema.index({ to: 1, status: 1 });
MatchSchema.index({ from: 1, status: 1 });

const Match =
  (mongoose.models.Match as mongoose.Model<IMatchDocument>) ||
  mongoose.model<IMatchDocument>('Match', MatchSchema);

export { Match };
export default Match;
