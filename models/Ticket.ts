import mongoose, { Schema } from 'mongoose';
import { ITicketDocument, TicketStatus } from '@/types';

const TicketSchema = new Schema<ITicketDocument>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [120, 'Event name cannot exceed 120 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [20, 'Cannot list more than 20 tickets'],
      default: 1,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'] as TicketStatus[],
      default: 'available',
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
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

TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ seller: 1 });
TicketSchema.index({ event: 1 });

const Ticket =
  (mongoose.models.Ticket as mongoose.Model<ITicketDocument>) ||
  mongoose.model<ITicketDocument>('Ticket', TicketSchema);

export { Ticket };
export default Ticket;
