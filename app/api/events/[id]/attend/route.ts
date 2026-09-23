import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// POST /api/events/[id]/attend - Toggle attendance
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    await connectDB();

    const userId = (session!.user as { id: string }).id;
    const userCollege = (session!.user as { college: string }).college;

    const event = await Event.findOne({ _id: params.id, isActive: true });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const existingIdx = event.attendees.findIndex(
      (a) => a.userId.toString() === userId
    );

    let isAttending: boolean;
    if (existingIdx > -1) {
      // Remove attendance
      event.attendees.splice(existingIdx, 1);
      isAttending = false;
    } else {
      // Add attendance
      event.attendees.push({
        userId: new mongoose.Types.ObjectId(userId),
        college: userCollege as 'DTU' | 'NSUT' | 'IGDTUW' | 'IIIT' | 'IIT Delhi' | 'Other',
      });
      isAttending = true;
    }

    await event.save();

    // Build college breakdown
    const collegeBreakdown: Record<string, number> = {};
    for (const a of event.attendees) {
      collegeBreakdown[a.college] = (collegeBreakdown[a.college] ?? 0) + 1;
    }

    return NextResponse.json({
      isAttending,
      totalAttendees: event.attendees.length,
      collegeBreakdown,
    });
  } catch (err) {
    console.error('[POST /api/events/[id]/attend]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
