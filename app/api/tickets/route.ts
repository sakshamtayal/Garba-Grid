import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/models/Ticket';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const CreateTicketSchema = z.object({
  eventName: z.string().min(2).max(120),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(20),
  description: z.string().min(5).max(500),
  contactInfo: z.string().min(5).max(200),
});

// GET /api/tickets - All available ticket listings (paginated)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const eventName = searchParams.get('eventName');
    const sort = searchParams.get('sort') ?? 'newest';

    const query: Record<string, unknown> = { status: 'available' };
    if (eventName) {
      query.eventName = { $regex: eventName, $options: 'i' };
    }

    const sortOrder: Record<string, 1 | -1> =
      sort === 'cheapest' ? { price: 1 } : { createdAt: -1 };

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('sellerId', 'name username college profilePicture')
        .sort(sortOrder)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    return NextResponse.json({ tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /api/tickets]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets - Create ticket listing
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = CreateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;

    const ticket = await Ticket.create({
      ...parsed.data,
      sellerId: userId,
    });

    await ticket.populate('sellerId', 'name username college profilePicture');

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/tickets]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
