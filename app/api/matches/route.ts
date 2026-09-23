import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// ─── GET /api/matches ─────────────────────────────────────────────────────────

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session!.user.id);

  // Get all matches involving this user that resulted in 'connected' status
  const connected = await Match.find({
    $or: [
      { from: userId, status: 'connected' },
      { to: userId, status: 'connected' },
    ],
  })
    .populate('from', '-password')
    .populate('to', '-password')
    .sort({ updatedAt: -1 })
    .lean();

  // Get pending matches where others connected TO this user
  const pending = await Match.find({
    to: userId,
    status: 'pending',
  })
    .populate('from', '-password')
    .sort({ createdAt: -1 })
    .lean();

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

  const sanitizedConnected = connected.map((m) => ({
    _id: (m._id as mongoose.Types.ObjectId).toString(),
    from: sanitizeUser(m.from as unknown as Record<string, unknown>),
    to: sanitizeUser(m.to as unknown as Record<string, unknown>),
    status: m.status,
    createdAt: (m.createdAt as Date).toISOString(),
    updatedAt: m.createdAt ? new Date(m.createdAt as Date).toISOString() : new Date().toISOString(),
  }));

  const sanitizedPending = pending.map((m) => ({
    _id: (m._id as mongoose.Types.ObjectId).toString(),
    from: sanitizeUser(m.from as unknown as Record<string, unknown>),
    status: m.status,
    createdAt: (m.createdAt as Date).toISOString(),
  }));

  return NextResponse.json({
    success: true,
    data: { connected: sanitizedConnected, pending: sanitizedPending },
  });
}

// ─── POST /api/matches ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json() as { toUserId?: string; action?: string };
    const { toUserId, action } = body;

    if (
      !toUserId ||
      !action ||
      !['connect', 'pass'].includes(action)
    ) {
      return NextResponse.json(
        { success: false, error: 'toUserId and action (connect|pass) are required' },
        { status: 400 },
      );
    }

    const fromUserId = session!.user.id;

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot match with yourself' },
        { status: 400 },
      );
    }

    await connectDB();

    // Verify target user exists
    const targetUser = await User.findById(toUserId).lean();
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    const fromId = new mongoose.Types.ObjectId(fromUserId);
    const toId = new mongoose.Types.ObjectId(toUserId);

    // Check if reverse match already exists (target already connected/passed current user)
    const reverseMatch = await Match.findOne({ from: toId, to: fromId });

    let isMutualMatch = false;
    let connectedUser = null;

    if (reverseMatch) {
      // Update existing reverse match to reflect both actions
      if (action === 'connect' && reverseMatch.status === 'pending') {
        // Mutual connect → connected!
        reverseMatch.status = 'connected';
        reverseMatch.mutualConnectedAt = new Date();
        await reverseMatch.save();
        isMutualMatch = true;

        // Fetch the target user profile for celebration
        connectedUser = {
          _id: (targetUser._id as mongoose.Types.ObjectId).toString(),
          username: targetUser.username,
          name: targetUser.name,
          profilePicture: targetUser.profilePicture,
          college: targetUser.college,
          gender: targetUser.gender,
          bio: targetUser.bio,
          hobbies: targetUser.hobbies,
          dandiayaSkillLevel: targetUser.dandiayaSkillLevel,
          instagramId: targetUser.instagramId,
          isAdmin: targetUser.isAdmin,
          allowDirectDMs: targetUser.allowDirectDMs,
          createdAt: (targetUser.createdAt as Date).toISOString(),
        };
      }
    } else {
      // Create new match record
      const newStatus = action === 'pass' ? 'passed' : 'pending';
      await Match.create({
        from: fromId,
        to: toId,
        status: newStatus,
        fromAction: action,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        isMutualMatch,
        connectedUser,
      },
      message: isMutualMatch
        ? "It's a match! 🎉"
        : action === 'connect'
          ? 'Connect request sent!'
          : 'Passed',
    });
  } catch (err) {
    console.error('Match action error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
