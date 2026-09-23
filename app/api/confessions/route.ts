import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Confession } from '@/models/Confession';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const COLLEGES = ['DTU', 'NSUT', 'IGDTUW', 'NIT', 'IIIT', 'IIT Delhi', 'DU', 'IPU', 'Other'] as const;

const CreateConfessionSchema = z.object({
  content: z.string().min(5).max(500),
  college: z.enum(COLLEGES).optional(),
  isAnonymous: z.boolean().default(true),
});

// GET /api/confessions - Approved confessions (paginated, optional ?college= filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const college = searchParams.get('college');

    const query: Record<string, unknown> = {};
    if (college && COLLEGES.includes(college as (typeof COLLEGES)[number])) {
      query.college = college;
    }

    const [rawConfessions, total] = await Promise.all([
      Confession.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Confession.countDocuments(query),
    ]);

    // Strip author when isAnonymous
    const confessions = rawConfessions.map((c) => {
      if (c.isAnonymous) {
        const { author: _author, reports: _reports, ...rest } = c;
        return rest;
      }
      const { reports: _reports, ...rest } = c;
      return rest;
    });

    return NextResponse.json({ confessions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /api/confessions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/confessions - Create confession
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateConfessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const confession = await Confession.create({
      ...parsed.data,
      authorId: userId,
      isApproved: true,
    });

    return NextResponse.json(
      { message: 'Confession posted!', confessionId: confession._id },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/confessions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
