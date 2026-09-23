'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types';
import ProfileView from '@/components/profile/ProfileView';
import DandiayaLoader from '@/components/ui/DandiayaLoader';
import Button from '@/components/ui/Button';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const username = params.username as string;
  const currentUsername = (session?.user as { username?: string })?.username;

  useEffect(() => {
    if (username && currentUsername && username === currentUsername) {
      router.replace('/profile');
      return;
    }
    if (username) {
      fetchPublicProfile(username);
    }
  }, [username, currentUsername]);

  const fetchPublicProfile = async (uname: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${uname}`);
      setProfile(res.data.user || null);
    } catch {
      toast.error('Could not find this student profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <DandiayaLoader size="lg" />
        <p className="text-text-muted text-sm">Finding student profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <p className="text-text-secondary text-sm">Student profile not found or unavailable.</p>
        <Button onClick={() => router.push('/discover')} className="mt-4">
          Back to Discover
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <ProfileView profile={profile} isOwnProfile={false} />
    </div>
  );
}
