import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Squad } from '@/models/Squad';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const CreateSquadSchema = z.object({
  name: z.string().min(3).max(60),
});

// GET /api/squads - Get current user's squads
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const squads = await Squad.find({ 'members.userId': userId })
      .populate('members.userId', 'name username profilePicture college')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ squads }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/squads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/squads - Create a new squad
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateSquadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;

    // Generate unique 8-char alphanumeric invite code
    const inviteCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    const inviteLink = `/squads/join/${inviteCode}`;

    const squad = await Squad.create({
      name: parsed.data.name,
      inviteCode,
      inviteLink,
      members: [{ userId, role: 'leader' }],
    });

    await squad.populate('members.userId', 'name username profilePicture college');

    return NextResponse.json({ squad }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/squads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
