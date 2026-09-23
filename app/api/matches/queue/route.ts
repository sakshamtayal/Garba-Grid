import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';
import type { IUserDocument } from '@/types';

// ─── GET /api/matches/queue ───────────────────────────────────────────────────

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session!.user.id);
  const userCollege = session!.user.college;

  // Get all users this person has already interacted with
  const interacted = await Match.find({
    $or: [{ from: userId }, { to: userId }],
  })
    .select('from to')
    .lean();

  const excludedIds = new Set<string>([session!.user.id]);
  interacted.forEach((m) => {
    excludedIds.add((m.from as mongoose.Types.ObjectId).toString());
    excludedIds.add((m.to as mongoose.Types.ObjectId).toString());
  });

  const excludedObjectIds = Array.from(excludedIds).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  // Fetch unmatched users — same college first (priority), then others
  const BATCH_SIZE = 20;

  const sameCollegeProfiles = (await User.find({
    _id: { $nin: excludedObjectIds },
    college: userCollege,
  })
    .select('-password')
    .limit(BATCH_SIZE)
    .lean()) as unknown as IUserDocument[];

  const remainingLimit = BATCH_SIZE - sameCollegeProfiles.length;

  let otherProfiles: IUserDocument[] = [];
  if (remainingLimit > 0) {
    const sameCollegeIds = sameCollegeProfiles.map((u) => u._id);
    otherProfiles = (await User.find({
      _id: { $nin: [...excludedObjectIds, ...sameCollegeIds] },
      college: { $ne: userCollege },
    })
      .select('-password')
      .limit(remainingLimit)
      .lean()) as unknown as IUserDocument[];
  }

  const allProfiles = [...sameCollegeProfiles, ...otherProfiles];
  const shuffled = shuffle(allProfiles);

  const sanitized = shuffled.map((u) => ({
    _id: (u._id as mongoose.Types.ObjectId).toString(),
    username: u.username,
    name: u.name,
    gender: u.gender,
    college: u.college,
    age: u.age,
    instagramId: u.instagramId,
    bio: u.bio,
    profilePicture: u.profilePicture,
    hobbies: u.hobbies,
    dandiayaSkillLevel: u.dandiayaSkillLevel,
    isAdmin: u.isAdmin,
    allowDirectDMs: u.allowDirectDMs,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return NextResponse.json({
    success: true,
    data: sanitized,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
