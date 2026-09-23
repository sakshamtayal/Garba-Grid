import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Squad } from '@/models/Squad';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/squads/[id] - Squad details with members
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid squad ID' }, { status: 400 });
    }
    await connectDB();

    const squad = await Squad.findById(params.id)
      .populate('members.userId', 'name username profilePicture college')
      .lean();

    if (!squad) return NextResponse.json({ error: 'Squad not found' }, { status: 404 });
    return NextResponse.json({ squad }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/squads/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/squads/[id] - Disband squad (leader only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid squad ID' }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const squad = await Squad.findById(params.id);
    if (!squad) return NextResponse.json({ error: 'Squad not found' }, { status: 404 });

    const isLeader = squad.members.some(
      (m: { userId: mongoose.Types.ObjectId; role: string }) =>
        m.userId.toString() === userId && m.role === 'leader'
    );
    if (!isLeader) {
      return NextResponse.json({ error: 'Only the leader can disband the squad' }, { status: 403 });
    }

    await squad.deleteOne();
    return NextResponse.json({ message: 'Squad disbanded' }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /api/squads/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
