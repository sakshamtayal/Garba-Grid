import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Confession } from '@/models/Confession';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

// POST /api/confessions/[id]/like - Toggle like
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid confession ID' }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const confession = await Confession.findOne({ _id: params.id, isApproved: true });
    if (!confession) return NextResponse.json({ error: 'Confession not found' }, { status: 404 });

    const alreadyLiked = confession.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      confession.likes = confession.likes.filter((id) => id.toString() !== userId) as typeof confession.likes;
    } else {
      confession.likes.push(userObjectId);
    }

    await confession.save();
    return NextResponse.json({ liked: !alreadyLiked, likeCount: confession.likes.length });
  } catch (err) {
    console.error('[POST /api/confessions/[id]/like]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
