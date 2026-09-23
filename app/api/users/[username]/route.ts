import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
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
});

// ─── GET /api/users/[username] ────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  if (!username) {
    return NextResponse.json(
      { success: false, error: 'Username is required' },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).lean();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 },
    );
  }

  // Public profile — no password, no sensitive fields
  const publicProfile = {
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

  return NextResponse.json({ success: true, data: publicProfile });
}

// ─── PATCH /api/users/[username] ─────────────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: { username: string } },
) {
  const { username } = params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  // Only allow updating own profile (or admin)
  if (
    session.user.username !== username.toLowerCase() &&
    !session.user.isAdmin
  ) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: you can only update your own profile' },
      { status: 403 },
    );
  }

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

    const updated = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
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
      message: 'Profile updated',
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
