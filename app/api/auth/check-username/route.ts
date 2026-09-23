import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// ─── GET /api/auth/check-username?username=xyz ────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase().trim();

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, error: 'Too short' }, { status: 400 });
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, error: 'Invalid characters' }, { status: 400 });
  }

  if (username.length > 30) {
    return NextResponse.json({ available: false, error: 'Too long' }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ username }).select('_id').lean();

  return NextResponse.json({ available: !existing });
}
