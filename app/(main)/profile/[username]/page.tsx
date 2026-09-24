'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types';
import ProfileView from '@/components/profile/ProfileView';
import DandiayaLoader from '@/components/ui/DandiayaLoader';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

type MatchStatus = 'connected' | 'pending' | 'passed' | null;

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>(null);
  const [dmLoading, setDmLoading] = useState(false);

  const username = params.username as string;
  const currentUsername = (session?.user as { username?: string })?.username;

  // ── Fetch the public profile ──────────────────────────────────────────────
  const fetchPublicProfile = useCallback(async (uname: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${uname}`);
      const fetchedProfile: UserProfile = res.data.user || null;
      setProfile(fetchedProfile);

      // After we have the profile, check match status
      if (fetchedProfile) {
        checkMatchStatus(fetchedProfile._id);
      }
    } catch {
      toast.error('Could not find this student profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Check match status between current user and this profile ─────────────
  const checkMatchStatus = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/connections');
      const json = await res.json();
      if (!json.success) return;

      const { connected, sent } = json.data as {
        connected: { user: { _id: string } }[];
        sent: { user: { _id: string } }[];
      };

      const isConnected = connected.some((c) => c.user._id === targetUserId);
      if (isConnected) {
        setMatchStatus('connected');
        return;
      }

      const isSent = sent.some((s) => s.user._id === targetUserId);
      if (isSent) {
        setMatchStatus('pending');
        return;
      }

      setMatchStatus(null);
    } catch {
      // silently fail — match status is non-critical
    }
  };

  // ── Open or create DM room and navigate to it ────────────────────────────
  const handleMessage = async () => {
    if (!profile || dmLoading) return;
    setDmLoading(true);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profile._id }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Could not open DM');
        return;
      }
      router.push(`/chat/${json.room._id}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDmLoading(false);
    }
  };

  useEffect(() => {
    if (username && currentUsername && username === currentUsername) {
      router.replace('/profile');
      return;
    }
    if (username) {
      fetchPublicProfile(username);
    }
  }, [username, currentUsername, fetchPublicProfile]);

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

      <ProfileView
        profile={profile}
        isOwnProfile={false}
        matchStatus={matchStatus}
        onMessage={matchStatus === 'connected' ? handleMessage : undefined}
      />
    </div>
  );
}
