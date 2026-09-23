import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { ReactNode } from 'react';

/**
 * Main app layout — wraps all authenticated pages.
 * The actual AppShell UI (sidebar, nav) lives inside AppShell component.
 * Session is fetched server-side and passed as a prop.
 */
export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-bg-primary">
      <AppShell session={session}>
        {children}
      </AppShell>
    </div>
  );
}

// ─── AppShell (inline, client side imports only via dynamic) ──────────────────

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('@/components/layout/AppShell'), {
  ssr: false,
});
