import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { v2 as cloudinary } from 'cloudinary';
import type { College, DandiayaSkillLevel, Gender } from '@/types';

// ─── Cloudinary Config ────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only contain lowercase letters, numbers, and underscores',
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say'] as const),
  college: z.enum(['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other'] as const),
  age: z.number().int().min(17).max(30).optional(),
  instagramId: z.string().max(50).optional(),
  bio: z.string().max(300).default(''),
  hobbies: z.array(z.string().max(30)).max(10).default([]),
  dandiayaSkillLevel: z.enum([
    'professional',
    'chaos_merchant',
    'left_right_struggler',
  ] as const),
  profilePicture: z.string().optional(), // base64 data URL or cloudinary URL
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const {
      username,
      password,
      name,
      gender,
      college,
      age,
      instagramId,
      bio,
      hobbies,
      dandiayaSkillLevel,
      profilePicture,
    } = parsed.data;

    await connectDB();

    // Check username uniqueness
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Upload profile picture to Cloudinary if provided
    let profilePictureUrl: string | undefined;

    if (profilePicture && profilePicture.startsWith('data:image/')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profilePicture, {
          folder: 'garba-grid/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          resource_type: 'image',
        });
        profilePictureUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Continue without profile picture rather than failing registration
      }
    }

    // Determine if this user should be admin
    const isAdmin =
      username.toLowerCase() === process.env.ADMIN_USERNAME?.toLowerCase();

    // Create user document
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      gender: gender as Gender,
      college: college as College,
      age,
      instagramId: instagramId?.trim() || undefined,
      bio: bio || '',
      hobbies: hobbies || [],
      dandiayaSkillLevel: dandiayaSkillLevel as DandiayaSkillLevel,
      profilePicture: profilePictureUrl || '',
      isAdmin,
      allowDirectDMs: true,
    });

    // Return sanitized user (no password)
    const sanitizedUser = {
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      gender: user.gender,
      college: user.college,
      age: user.age,
      instagramId: user.instagramId,
      bio: user.bio,
      profilePicture: user.profilePicture,
      hobbies: user.hobbies,
      dandiayaSkillLevel: user.dandiayaSkillLevel,
      isAdmin: user.isAdmin,
      allowDirectDMs: user.allowDirectDMs,
      createdAt: new Date(user.createdAt).toISOString(),
    };

    return NextResponse.json(
      { success: true, data: sanitizedUser, message: 'Account created successfully!' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register error:', error);

    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
