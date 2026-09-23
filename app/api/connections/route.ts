import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// ─── GET /api/connections ─────────────────────────────────────────────────────
// Returns:
//   connected  → mutual matches (both accepted)
//   sent       → pending requests I sent (waiting for them)

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session!.user.id);

  const sanitizeUser = (user: Record<string, unknown>) => ({
    _id: (user._id as mongoose.Types.ObjectId).toString(),
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
  });

  // Mutual connections (status = connected, either side)
  const connectedMatches = await Match.find({
    $or: [
      { from: userId, status: 'connected' },
      { to: userId, status: 'connected' },
    ],
  })
    .populate('from', '-password')
    .populate('to', '-password')
    .sort({ updatedAt: -1 })
    .lean();

  // Requests I sent that are still pending
  const sentMatches = await Match.find({
    from: userId,
    status: 'pending',
  })
    .populate('to', '-password')
    .sort({ createdAt: -1 })
    .lean();

  const connected = connectedMatches.map((m) => {
    const fromUser = m.from as unknown as Record<string, unknown>;
    const toUser = m.to as unknown as Record<string, unknown>;
    const otherUser =
      fromUser._id?.toString() === session!.user.id ? toUser : fromUser;
    return {
      matchId: (m._id as mongoose.Types.ObjectId).toString(),
      user: sanitizeUser(otherUser),
      connectedAt: m.createdAt ? new Date(m.createdAt as Date).toISOString() : null,
    };
  });

  const sent = sentMatches.map((m) => ({
    matchId: (m._id as mongoose.Types.ObjectId).toString(),
    user: sanitizeUser(m.to as unknown as Record<string, unknown>),
    sentAt: m.createdAt ? new Date(m.createdAt as Date).toISOString() : null,
  }));

  return NextResponse.json({ success: true, data: { connected, sent } });
}
