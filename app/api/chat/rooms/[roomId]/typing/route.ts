import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import mongoose from 'mongoose';

// ── POST /api/chat/rooms/[roomId]/typing ───────────────────────────────────────
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

  const { isTyping } = await req.json();
  const user = session.user as any;

  await pusherServer.trigger(`room-${roomId}`, 'typing', {
    username: user.username ?? user.name,
    isTyping: !!isTyping,
  });

  return NextResponse.json({ success: true });
}
