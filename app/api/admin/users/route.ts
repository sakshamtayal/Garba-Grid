import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

function isAdmin(user: any): boolean {
  return user?.isAdmin === true || user?.username === process.env.ADMIN_USERNAME;
}

// ── GET /api/admin/users ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1');
  const search = req.nextUrl.searchParams.get('search') ?? '';
  const PAGE_SIZE = 25;

  const User = mongoose.models.User;
  if (!User) {
    return NextResponse.json({ error: 'User model not loaded' }, { status: 500 });
  }

  const filter: Record<string, any> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { college: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name username college gender profilePicture isAdmin isDisabled createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(filter),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

// ── PATCH /api/admin/users — toggle admin or disable ──────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const { userId, action } = await req.json();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  const User = mongoose.models.User;
  if (!User) {
    return NextResponse.json({ error: 'User model not loaded' }, { status: 500 });
  }

  let update: Record<string, any> = {};
  if (action === 'toggle-admin') {
    const user = await User.findById(userId).select('isAdmin').lean() as any;
    update = { isAdmin: !user?.isAdmin };
  } else if (action === 'toggle-disable') {
    const user = await User.findById(userId).select('isDisabled').lean() as any;
    update = { isDisabled: !user?.isDisabled };
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updated = await User.findByIdAndUpdate(userId, update, { new: true })
    .select('name username isAdmin isDisabled')
    .lean();

  return NextResponse.json({ user: updated });
}
