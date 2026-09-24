import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { seedEvents } from '@/lib/seedEvents';

// POST /api/admin/seed-events — Admin only: seed pre-built events
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = await seedEvents();
    return NextResponse.json(
      { message: `${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped.`, ...result },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/admin/seed-events]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
