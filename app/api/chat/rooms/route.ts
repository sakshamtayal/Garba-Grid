import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ChatRoom } from '@/lib/models/chat';
import Match from '@/models/Match';
import mongoose from 'mongoose';

// ── GET /api/chat/rooms ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = session.user as any;
  const userId = new mongoose.Types.ObjectId(user.id ?? user._id);
  const userCollege: string = user.college ?? '';
  const userGender: string = user.gender ?? 'all';

  // ── Accessible gender filter rooms ─────────────────────────────────────────
  const genderFilters: ('all' | 'male' | 'female')[] = ['all'];
  if (userGender === 'male') genderFilters.push('male');
  if (userGender === 'female') genderFilters.push('female');

  const [prebuiltRooms, dmRooms, squadRooms] = await Promise.all([
    // Pre-built: college channels (all), general (all), gender-specific (filtered)
    ChatRoom.find({
      isPrebuilt: true,
      $or: [
        { type: { $in: ['college_channel', 'general'] } },
        { type: 'gender_specific', genderFilter: { $in: genderFilters } },
      ],
    })
      .sort({ type: 1, name: 1 })
      .lean(),

    // DM rooms the user is part of
    ChatRoom.find({
      type: 'dm',
      members: userId,
    })
      .sort({ lastActivity: -1 })
      .populate('members', 'name username profilePicture college')
      .lean(),

    // Squad rooms the user is in
    ChatRoom.find({
      type: 'squad',
      members: userId,
    })
      .sort({ lastActivity: -1 })
      .lean(),
  ]);

  // For college channels, only include the user's own college + general/gender
  const filtered = prebuiltRooms.filter((room) => {
    if (room.type === 'college_channel') {
      return room.college === userCollege;
    }
    return true;
  });

  return NextResponse.json({
    rooms: {
      college: filtered.filter((r) => r.type === 'college_channel'),
      general: filtered.filter((r) => r.type === 'general'),
      genderSpecific: filtered.filter((r) => r.type === 'gender_specific'),
      dms: dmRooms,
      squads: squadRooms,
    },
  });
}

// ── POST /api/chat/rooms ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const { targetUserId } = await req.json();

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
  }

  await connectDB();

  const myId = new mongoose.Types.ObjectId(user.id ?? user._id);
  const theirId = new mongoose.Types.ObjectId(targetUserId);

  if (myId.equals(theirId)) {
    return NextResponse.json({ error: 'Cannot DM yourself' }, { status: 400 });
  }

  // ── Mutual connection gate ─────────────────────────────────────────────────
  const mutualMatch = await Match.findOne({
    $or: [
      { from: myId, to: theirId, status: 'connected' },
      { from: theirId, to: myId, status: 'connected' },
    ],
  });

  if (!mutualMatch) {
    return NextResponse.json(
      { error: 'You can only DM people you are mutually connected with.' },
      { status: 403 }
    );
  }

  const serializeRoom = (r: any) => ({
    _id: r._id.toString(),
    type: r.type,
    name: r.name,
    description: r.description,
    members: (r.members as any[]).map((m: any) => m.toString()),
    isPrebuilt: r.isPrebuilt,
    college: r.college,
    genderFilter: r.genderFilter,
    lastActivity: r.lastActivity instanceof Date ? r.lastActivity.toISOString() : r.lastActivity,
  });

  // Check if DM already exists
  const existing = await ChatRoom.findOne({
    type: 'dm',
    members: { $all: [myId, theirId], $size: 2 },
  });

  if (existing) {
    return NextResponse.json({ room: serializeRoom(existing) });
  }

  // Create new DM room
  const room = await ChatRoom.create({
    type: 'dm',
    name: 'DM',
    isPrebuilt: false,
    members: [myId, theirId],
    genderFilter: 'all',
    lastActivity: new Date(),
  });

  return NextResponse.json({ room: serializeRoom(room) }, { status: 201 });
}
