import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { z } from 'zod';

const CreateEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  venue: z.string().min(3),
  date: z.string().datetime(),
  price: z.union([z.number().nonnegative(), z.literal('Free')]),
  bookingLink: z.string().url(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

// GET /api/events - List all active events sorted by date
export async function GET() {
  try {
    await connectDB();
    const events = await Event.find({ isActive: true }).sort({ date: 1 }).lean();
    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/events - Create event (admin only)
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const event = await Event.create({
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || undefined,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
