import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminPanel } from '@/components/admin/AdminPanel';

export const metadata = {
  title: 'Admin Panel — GarbaGrid',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  const user = session.user as any;
  const isAdmin =
    user.isAdmin === true || user.username === process.env.ADMIN_USERNAME;

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Admin header banner */}
      <div className="bg-bg-secondary border-b border-border-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-lg font-bold text-text-primary">GarbaGrid Admin</h1>
              <p className="text-xs text-text-muted">
                Logged in as{' '}
                <span className="text-accent-gold font-medium">@{user.username}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-gold/10 border border-accent-gold/20">
            <div className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
            <span className="text-xs text-accent-gold font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminPanel currentUserId={user._id} />
      </div>
    </div>
  );
}
