import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ChatRoom, Message } from '@/lib/models/chat';
import { pusherServer } from '@/lib/pusher';
import mongoose from 'mongoose';

// ── GET /api/chat/rooms/[roomId]/messages ──────────────────────────────────────
// Cursor-based pagination: cursor = oldest message _id in current view
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
  const cursorParam = req.nextUrl.searchParams.get('cursor');
  const PAGE_SIZE = 50;

  // Build query
  const query: Record<string, any> = {
    roomId: new mongoose.Types.ObjectId(roomId),
  };

  if (cursorParam && mongoose.Types.ObjectId.isValid(cursorParam)) {
    // Fetch messages older than cursor
    const cursorMsg = await Message.findById(cursorParam).select('createdAt').lean();
    if (cursorMsg) {
      query.createdAt = { $lt: cursorMsg.createdAt };
    }
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE + 1)
    .populate('sender', 'name username profilePicture college')
    .lean();

  const hasMore = messages.length > PAGE_SIZE;
  if (hasMore) messages.pop();

  const ordered = messages.reverse();
  const nextCursor = hasMore && ordered.length > 0 ? ordered[0]._id.toString() : null;

  return NextResponse.json({ messages: ordered, nextCursor, hasMore });
}

// ── POST /api/chat/rooms/[roomId]/messages ─────────────────────────────────────
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

  const body = await req.json();
  const content: string = (body.content ?? '').trim();
  const type: 'text' | 'image' = body.type === 'image' ? 'image' : 'text';

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 });
  }

  await connectDB();

  const user = session.user as any;
  const room = await ChatRoom.findById(roomId).select('_id lastActivity').lean();
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Save message
  const message = await Message.create({
    roomId: new mongoose.Types.ObjectId(roomId),
    sender: new mongoose.Types.ObjectId(user._id),
    content,
    type,
  });

  // Update room lastActivity
  await ChatRoom.findByIdAndUpdate(roomId, { lastActivity: new Date() });

  // Populate sender for Pusher payload
  const populated = await Message.findById(message._id)
    .populate('sender', 'name username profilePicture college')
    .lean();

  const messageData = {
    _id: populated!._id.toString(),
    roomId,
    sender: {
      _id: (populated!.sender as any)._id.toString(),
      username: (populated!.sender as any).username,
      name: (populated!.sender as any).name,
      profilePicture: (populated!.sender as any).profilePicture,
      college: (populated!.sender as any).college,
    },
    content: populated!.content,
    type: populated!.type,
    createdAt: populated!.createdAt.toISOString(),
  };

  // Fire Pusher event
  await pusherServer.trigger(`room-${roomId}`, 'new-message', messageData);

  return NextResponse.json({ message: messageData }, { status: 201 });
}
