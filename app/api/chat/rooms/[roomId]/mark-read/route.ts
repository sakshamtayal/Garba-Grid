import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Message } from '@/lib/models/chat';
import mongoose from 'mongoose';

// ── POST /api/chat/rooms/[roomId]/mark-read ────────────────────────────────────
export async function POST(
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
  const userId = new mongoose.Types.ObjectId(user._id);

  await Message.updateMany(
    {
      roomId: new mongoose.Types.ObjectId(roomId),
      readBy: { $ne: userId },
    },
    { $addToSet: { readBy: userId } }
  );

  return NextResponse.json({ success: true });
}
