import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Confession } from '@/models/Confession';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const ReportSchema = z.object({
  reason: z.string().min(5).max(300),
});

// POST /api/confessions/[id]/report - Report a confession
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid confession ID' }, { status: 400 });
    }
    const body = await req.json();
    const parsed = ReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const confession = await Confession.findOne({ _id: params.id, isApproved: true });
    if (!confession) return NextResponse.json({ error: 'Confession not found' }, { status: 404 });

    // Prevent duplicate reports from same user
    const alreadyReported = confession.reports?.some((r) => r.userId?.toString() === userId);
    if (alreadyReported) {
      return NextResponse.json({ message: 'Already reported' }, { status: 200 });
    }

    confession.reports.push({
      userId: new mongoose.Types.ObjectId(userId),
      reason: parsed.data.reason,
    });

    await confession.save();
    return NextResponse.json({ message: 'Confession reported — our team will review it' });
  } catch (err) {
    console.error('[POST /api/confessions/[id]/report]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
