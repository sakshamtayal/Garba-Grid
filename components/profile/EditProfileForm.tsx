'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import imageCompression from 'browser-image-compression';
import { UserProfile, College, DandiayaSkillLevel, Gender } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Camera, Sparkles, Check, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
  college: z.enum(['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other']),
  age: z.coerce.number().min(16).max(35).optional().or(z.literal('')),
  instagramId: z.string().optional(),
  bio: z.string().max(250, 'Bio max 250 characters').optional(),
  dandiayaSkillLevel: z.enum(['professional', 'chaos_merchant', 'left_right_struggler']),
  allowDirectDMs: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
  onCancel?: () => void;
}

const SKILL_OPTIONS: { id: DandiayaSkillLevel; title: string; subtitle: string; icon: string }[] = [
  {
    id: 'professional',
    title: 'Professional / Will Teach',
    subtitle: 'Can do 12-step twirls blindly 💃',
    icon: '🥁',
  },
  {
    id: 'chaos_merchant',
    title: 'Chaos Merchant',
    subtitle: 'High hype, zero coordination 🔥',
    icon: '🌀',
  },
  {
    id: 'left_right_struggler',
    title: 'Left/Right Foot Struggler',
    subtitle: 'Here for the vibes & jalebis 👟',
    icon: '👟',
  },
];

export default function EditProfileForm({ user, onProfileUpdated, onCancel }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState<string[]>(user.hobbies || []);
  const [hobbyInput, setHobbyInput] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>(user.profilePicture || '');
  const [selectedSkill, setSelectedSkill] = useState<DandiayaSkillLevel>(user.dandiayaSkillLevel || 'chaos_merchant');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      gender: user.gender,
      college: user.college,
      age: user.age || undefined,
      instagramId: user.instagramId || '',
      bio: user.bio || '',
      dandiayaSkillLevel: user.dandiayaSkillLevel || 'chaos_merchant',
      allowDirectDMs: user.allowDirectDMs || false,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Optimizing image...', { id: 'img-opt' });
      const options = {
        maxSizeMB: 0.2, // ~200KB limit
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        toast.success('Image compressed & ready! 📸', { id: 'img-opt' });
      };
    } catch {
      toast.error('Failed to compress image.', { id: 'img-opt' });
    }
  };

  const addHobby = () => {
    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim()) && hobbies.length < 8) {
      setHobbies([...hobbies, hobbyInput.trim()]);
      setHobbyInput('');
    }
  };

  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        age: data.age === '' ? undefined : data.age,
        hobbies,
        profilePicture,
        dandiayaSkillLevel: selectedSkill,
      };

      const res = await axios.patch('/api/users/me', payload);
      toast.success('Profile updated successfully! ✨');
      if (onProfileUpdated && res.data.user) {
        onProfileUpdated(res.data.user);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to update profile' : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-bg-card p-6 rounded-3xl border border-border-primary">
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group">
          <Avatar
            src={profilePicture}
            name={user.name}
            size="2xl"
            college={user.college}
          />
          <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera size={20} />
            <span className="text-[10px] mt-1 font-semibold">Change</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        <p className="text-[11px] text-text-muted">Auto-compressed under 200KB for instant loading</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Saksham Tayal"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            College
          </label>
          <select
            {...register('college')}
            className="w-full bg-bg-secondary border border-border-primary focus:border-accent-marigold rounded-xl p-3 text-text-primary text-sm"
          >
            {['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Instagram Handle (Optional)"
          placeholder="@yourhandle"
          error={errors.instagramId?.message}
          {...register('instagramId')}
        />
        <Input
          label="Age (Optional)"
          type="number"
          placeholder="20"
          error={errors.age?.message}
          {...register('age')}
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          Bio & Vibe
        </label>
        <textarea
          {...register('bio')}
          rows={3}
          placeholder="Looking for a Dandiya partner or squad to hit up DTU and JLN nights! 🕺"
          className="w-full bg-bg-secondary border border-border-primary focus:border-accent-marigold focus:ring-1 focus:ring-accent-marigold rounded-xl p-3 text-text-primary text-sm placeholder-text-muted resize-none transition-colors"
        />
      </div>

      {/* Dandiya Skill Level Selector */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Dandiya Skill Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SKILL_OPTIONS.map((skill) => (
            <div
              key={skill.id}
              onClick={() => {
                setSelectedSkill(skill.id);
                setValue('dandiayaSkillLevel', skill.id);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedSkill === skill.id
                  ? 'bg-accent-marigold/15 border-accent-marigold shadow-marigold'
                  : 'bg-bg-secondary border-border-primary hover:border-border-accent'
              }`}
            >
              <div className="text-2xl mb-1">{skill.icon}</div>
              <div>
                <p className="font-bold text-xs text-text-primary">{skill.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{skill.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hobbies / Interests Tag Input */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
          Hobbies & Interests ({hobbies.length}/8)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHobby();
              }
            }}
            placeholder="Type interest & press Add"
            className="flex-1 bg-bg-secondary border border-border-primary rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-marigold"
          />
          <button
            type="button"
            onClick={addHobby}
            className="px-4 py-2 rounded-xl bg-bg-secondary hover:bg-bg-hover text-accent-marigold border border-border-primary text-xs font-semibold"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hobbies.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-accent text-xs text-text-primary"
            >
              #{h}
              <button type="button" onClick={() => removeHobby(i)} className="text-text-muted hover:text-status-danger">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Settings Toggle: Direct DMs */}
      <div className="p-4 bg-bg-secondary/70 rounded-2xl border border-border-primary flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-text-primary">Allow Direct DMs without Match</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            When enabled, users can message you directly without waiting for a mutual connect.
          </p>
        </div>
        <input
          type="checkbox"
          {...register('allowDirectDMs')}
          className="w-5 h-5 accent-accent-marigold rounded cursor-pointer"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="shadow-marigold">
          Save Profile ✨
        </Button>
      </div>
    </form>
  );
}
