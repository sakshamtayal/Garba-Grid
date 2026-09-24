import mongoose, { Schema } from 'mongoose';
import { IEventDocument, College } from '@/types';

const EventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    bookingLink: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    ticketPlatform: {
      type: String,
      default: '',
    },
    dateRange: {
      type: String,
      default: '',
    },
    attendees: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        college: {
          type: String,
          enum: ['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other'] as College[],
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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

EventSchema.index({ date: 1, isActive: 1 });

const Event =
  (mongoose.models.Event as mongoose.Model<IEventDocument>) ||
  mongoose.model<IEventDocument>('Event', EventSchema);

export { Event };
export default Event;
