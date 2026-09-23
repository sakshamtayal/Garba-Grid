import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ChatRoom, Message, Confession } from '@/lib/models/chat';
import mongoose from 'mongoose';

function isAdmin(user: any): boolean {
  return user?.isAdmin === true || user?.username === process.env.ADMIN_USERNAME;
}

// ── GET /api/admin/stats ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const User = mongoose.models.User;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    totalMessages,
    messagesLast24h,
    pendingConfessions,
    approvedConfessions,
    reportedConfessions,
    totalRooms,
  ] = await Promise.all([
    User ? User.countDocuments() : 0,
    User ? User.countDocuments({ createdAt: { $gte: last24h } }) : 0,
    User ? User.countDocuments({ createdAt: { $gte: last7d } }) : 0,
    Message.countDocuments(),
    Message.countDocuments({ createdAt: { $gte: last24h } }),
    Confession.countDocuments({ isApproved: false }),
    Confession.countDocuments({ isApproved: true }),
    Confession.countDocuments({ 'reports.0': { $exists: true } }),
    ChatRoom.countDocuments(),
  ]);

  // Recent signups (last 5)
  const recentUsers = User
    ? await User.find()
        .select('name username college createdAt profilePicture')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    : [];

  return NextResponse.json({
    users: { total: totalUsers, newToday: newUsersToday, newThisWeek: newUsersWeek },
    messages: { total: totalMessages, last24h: messagesLast24h },
    confessions: {
      pending: pendingConfessions,
      approved: approvedConfessions,
      reported: reportedConfessions,
    },
    rooms: { total: totalRooms },
    recentUsers,
  });
}
