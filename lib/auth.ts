import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export { authOptions };

export interface AuthSession {
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    image?: string;
    isAdmin: boolean;
    profilePicture?: string;
    college: string;
    gender: string;
  };
}

export type RequireAuthResult =
  | { session: AuthSession; error: null }
  | { session: null; error: NextResponse };

/**
 * Server-side helper for API routes to require authentication.
 * Returns { session, error }. If not authenticated, error is a 401 NextResponse.
 */
export async function requireAuth(): Promise<RequireAuthResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    session: session as unknown as AuthSession,
    error: null,
  };
}

/**
 * Server-side helper for admin-only API routes.
 */
export async function requireAdmin(): Promise<RequireAuthResult> {
  const res = await requireAuth();
  if (res.error) return res;

  if (!res.session.user.isAdmin) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
    };
  }

  return res;
}

export default authOptions;
