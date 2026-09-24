import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ChatRoom, Message } from '@/lib/models/chat';
import mongoose from 'mongoose';

function canAccessRoom(room: any, userId: string, userGender: string, userCollege: string): boolean {
  if (room.isPrebuilt) {
    if (room.type === 'college_channel') {
      return room.college === userCollege;
    }
    if (room.type === 'gender_specific') {
      return room.genderFilter === 'all' || room.genderFilter === userGender;
    }
    return true;
  }
  // For DM / squad: user must be a member
  return room.members.some((m: any) => m.toString() === userId);
}

// ── GET /api/chat/rooms/[roomId] ───────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { roomId } = params;
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return NextResponse.json({ error: 'Invalid roomId' }, { status: 400 });
  }

  await connectDB();

  const user = session.user as any;
  const room = await ChatRoom.findById(roomId).lean();

  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  if (!canAccessRoom(room, user.id, user.gender ?? '', user.college ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const serializedRoom = {
    _id: room._id.toString(),
    type: room.type,
    name: room.name,
    description: room.description,
    members: (room.members as any[]).map((m: any) => m.toString()),
    isPrebuilt: room.isPrebuilt,
    college: room.college,
    genderFilter: room.genderFilter,
    lastActivity: room.lastActivity instanceof Date ? room.lastActivity.toISOString() : room.lastActivity,
  };

  return NextResponse.json({ room: serializedRoom });
}
