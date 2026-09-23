import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Confession } from '@/lib/models/chat';

function isAdmin(user: any): boolean {
  return user?.isAdmin === true || user?.username === process.env.ADMIN_USERNAME;
}

// ── GET /api/admin/confessions ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1');
  const status = req.nextUrl.searchParams.get('status') ?? 'pending'; // pending | approved | reported
  const PAGE_SIZE = 20;

  const filter: Record<string, any> = {};
  if (status === 'pending') filter.isApproved = false;
  else if (status === 'approved') filter.isApproved = true;
  else if (status === 'reported') filter['reports.0'] = { $exists: true };

  const [confessions, total] = await Promise.all([
    Confession.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('submittedBy', 'name username college')
      .lean(),
    Confession.countDocuments(filter),
  ]);

  return NextResponse.json({
    confessions,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
