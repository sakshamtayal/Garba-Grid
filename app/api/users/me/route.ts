import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

// ─── Schema ───────────────────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  hobbies: z.array(z.string().max(30)).max(10).optional(),
  instagramId: z.string().max(50).optional(),
  age: z.number().int().min(17).max(30).optional(),
  allowDirectDMs: z.boolean().optional(),
  dandiayaSkillLevel: z
    .enum(['professional', 'chaos_merchant', 'left_right_struggler'])
    .optional(),
  college: z.string().min(2).max(30).optional(),
  profilePicture: z.string().optional(),
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const user = await User.findById(session!.user.id).lean();
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 },
    );
  }

  const sanitized = {
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
    createdAt: (user.createdAt as Date).toISOString(),
  };

  return NextResponse.json({ success: true, data: sanitized });
}

// ─── PATCH /api/users/me ──────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);

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

    await connectDB();

    const updates: Record<string, unknown> = {};
    const data = parsed.data;

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.hobbies !== undefined) updates.hobbies = data.hobbies;
    if (data.instagramId !== undefined)
      updates.instagramId = data.instagramId.trim() || undefined;
    if (data.age !== undefined) updates.age = data.age;
    if (data.allowDirectDMs !== undefined) updates.allowDirectDMs = data.allowDirectDMs;
    if (data.dandiayaSkillLevel !== undefined)
      updates.dandiayaSkillLevel = data.dandiayaSkillLevel;
    if (data.college !== undefined) updates.college = data.college.trim();

    // Handle profile picture upload
    if (data.profilePicture && data.profilePicture.startsWith('data:image/')) {
      try {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const result = await cloudinary.uploader.upload(data.profilePicture, {
          folder: 'garba-grid/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        });
        updates.profilePicture = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    } else if (
      data.profilePicture &&
      data.profilePicture.startsWith('https://')
    ) {
      updates.profilePicture = data.profilePicture;
    }

    const updated = await User.findByIdAndUpdate(
      session!.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    const sanitized = {
      _id: updated._id.toString(),
      username: updated.username,
      name: updated.name,
      gender: updated.gender,
      college: updated.college,
      age: updated.age,
      instagramId: updated.instagramId,
      bio: updated.bio,
      profilePicture: updated.profilePicture,
      hobbies: updated.hobbies,
      dandiayaSkillLevel: updated.dandiayaSkillLevel,
      isAdmin: updated.isAdmin,
      allowDirectDMs: updated.allowDirectDMs,
      createdAt: (updated.createdAt as Date).toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: sanitized,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
