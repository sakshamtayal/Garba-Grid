import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Confession } from '@/lib/models/chat';
import mongoose from 'mongoose';

function isAdmin(user: any): boolean {
  return user?.isAdmin === true || user?.username === process.env.ADMIN_USERNAME;
}

// ── PATCH /api/admin/confessions/[id] — approve or reject ─────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await connectDB();

  const { action } = await req.json(); // 'dismiss_reports' | 'reject'

  if (action === 'dismiss_reports') {
    const confession = await Confession.findByIdAndUpdate(
      params.id,
      { $set: { reports: [] } },
      { new: true }
    );
    return NextResponse.json({ confession });
  }

  if (action === 'reject') {
    await Confession.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action. Use dismiss_reports or reject.' }, { status: 400 });
}

// ── DELETE /api/admin/confessions/[id] ────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await connectDB();

  await Confession.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
