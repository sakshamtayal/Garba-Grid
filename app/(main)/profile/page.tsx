'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { UserProfile } from '@/types';
import ProfileView from '@/components/profile/ProfileView';
import EditProfileForm from '@/components/profile/EditProfileForm';
import Button from '@/components/ui/Button';
import DandiayaLoader from '@/components/ui/DandiayaLoader';
import { Edit3, LogOut, Sparkles, Shield, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/me');
      setProfile(res.data.user || null);
    } catch {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <DandiayaLoader size="lg" />
        <p className="text-text-muted text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <p className="text-text-secondary text-sm">Could not find profile details.</p>
        <Button onClick={fetchProfile} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top action controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
          <span>My Profile</span>
          <Sparkles size={18} className="text-accent-gold" />
        </h1>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-status-danger hover:bg-status-danger/10"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </div>

      {/* Main View / Edit Form */}
      {isEditing ? (
        <EditProfileForm
          user={profile}
          onProfileUpdated={handleProfileUpdated}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView profile={profile} isOwnProfile={true} />
      )}
    </div>
  );
}
