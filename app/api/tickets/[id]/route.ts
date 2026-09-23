import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/models/Ticket';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const UpdateStatusSchema = z.object({
  status: z.enum(['available', 'sold', 'reserved']),
});

// GET /api/tickets/[id] - Single ticket listing
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }
    await connectDB();
    const ticket = await Ticket.findById(params.id)
      .populate('seller', 'name username college profilePicture')
      .lean();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (err) {
    console.error('[GET /api/tickets/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets/[id] - Update status (seller only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }
    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;
    const ticket = await Ticket.findById(params.id);

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.seller.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden: not the seller' }, { status: 403 });
    }

    ticket.status = parsed.data.status;
    await ticket.save();
    await ticket.populate('seller', 'name username college profilePicture');

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error('[PATCH /api/tickets/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tickets/[id] - Remove listing (seller or admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    await connectDB();
    const userId = (session!.user as { id: string }).id;
    const isAdmin = (session!.user as { isAdmin?: boolean }).isAdmin;
    const ticket = await Ticket.findById(params.id);

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.seller.toString() !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ticket.deleteOne();
    return NextResponse.json({ message: 'Listing removed' });
  } catch (err) {
    console.error('[DELETE /api/tickets/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
