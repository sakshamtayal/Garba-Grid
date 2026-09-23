import mongoose, { Schema } from 'mongoose';
import { IUserDocument, College, Gender, DandiayaSkillLevel } from '@/types';

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non_binary', 'prefer_not_to_say'] as Gender[],
      required: [true, 'Gender is required'],
      default: 'prefer_not_to_say',
    },
    college: {
      type: String,
      enum: ['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other'] as College[],
      required: [true, 'College is required'],
    },
    age: {
      type: Number,
      min: [16, 'Age must be at least 16'],
      max: [40, 'Age cannot exceed 40'],
    },
    instagramId: {
      type: String,
      trim: true,
      maxlength: [50, 'Instagram ID cannot exceed 50 characters'],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    hobbies: {
      type: [String],
      default: [],
    },
    dandiayaSkillLevel: {
      type: String,
      enum: ['professional', 'chaos_merchant', 'left_right_struggler'] as DandiayaSkillLevel[],
      default: 'chaos_merchant',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    allowDirectDMs: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete (ret as Record<string, unknown>).password;
        return ret;
      },
    },
  }
);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ college: 1 });
UserSchema.index({ dandiayaSkillLevel: 1 });

export const User =
  (mongoose.models.User as mongoose.Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', UserSchema);

export default User;
