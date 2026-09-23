import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Squad from '@/models/Squad';
import ChatRoom from '@/models/ChatRoom';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// POST /api/squads/join/[code] - Join squad by invite code
export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const squad = await Squad.findOne({ inviteCode: params.code.toUpperCase() });
    if (!squad) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    const alreadyMember = squad.members.some(
      (m: { userId: mongoose.Types.ObjectId }) => m.userId.toString() === userId
    );
    if (alreadyMember) {
      return NextResponse.json({ message: 'Already a member', squad }, { status: 200 });
    }

    // Add user as member
    squad.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: 'member',
    });

    // Create or update squad chat room
    let chatRoom = await ChatRoom.findOne({ name: `${squad.name} - Squad Chat`, type: 'squad' });
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        type: 'squad',
        name: `${squad.name} - Squad Chat`,
        description: 'Squad celebration & coordination room',
        members: squad.members.map((m: { userId: mongoose.Types.ObjectId }) => m.userId),
        genderFilter: 'all',
        isPrebuilt: false,
      });
    } else {
      await ChatRoom.findByIdAndUpdate(chatRoom._id, {
        $addToSet: { members: new mongoose.Types.ObjectId(userId) },
      });
    }

    await squad.save();
    await squad.populate('members.userId', 'name username profilePicture college');

    return NextResponse.json({ squad, chatRoomId: chatRoom._id }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/squads/join/[code]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
