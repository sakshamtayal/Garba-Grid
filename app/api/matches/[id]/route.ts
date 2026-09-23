import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// ─── PATCH /api/matches/[id] ──────────────────────────────────────────────────
// Accept or decline an incoming connection request

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = (await req.json()) as { action?: string };
    const { action } = body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    await connectDB();

    const matchId = new mongoose.Types.ObjectId(params.id);
    const userId = new mongoose.Types.ObjectId(session!.user.id);

    // Only the recipient (to) can accept/decline
    const match = await Match.findOne({ _id: matchId, to: userId, status: 'pending' });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Request not found or already actioned' },
        { status: 404 }
      );
    }

    if (action === 'accept') {
      match.status = 'connected';
      match.mutualConnectedAt = new Date();
      await match.save();

      return NextResponse.json({
        success: true,
        message: "You're now connected! 🎉",
        data: { status: 'connected' },
      });
    } else {
      // decline → delete the match record so both can re-discover each other
      await Match.deleteOne({ _id: matchId });

      return NextResponse.json({
        success: true,
        message: 'Request declined.',
        data: { status: 'declined' },
      });
    }
  } catch (err) {
    console.error('Match PATCH error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
