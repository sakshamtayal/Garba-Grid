'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Check, X, Upload, Camera, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import imageCompression from 'browser-image-compression';
import type { College, DandiayaSkillLevel, Gender } from '@/types';
import { COLLEGES } from '@/lib/types';

// ─── Step Schemas ─────────────────────────────────────────────────────────────

const Step1Schema = z
  .object({
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .max(30)
      .regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'At least 2 characters').max(60),
    gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say'] as const),
    college: z.enum(['DTU', 'NSUT', 'IGDTUW', 'IIIT', 'IIT Delhi', 'Other'] as const),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Step2Schema = z.object({
  age: z.number().int().min(17).max(30).optional(),
  instagramId: z.string().max(50).optional(),
  bio: z.string().max(300).default(''),
  hobbies: z.array(z.string()).max(10).default([]),
  dandiayaSkillLevel: z.enum([
    'professional',
    'chaos_merchant',
    'left_right_struggler',
  ] as const),
});

type Step1Data = z.infer<typeof Step1Schema>;
type Step2Data = z.infer<typeof Step2Schema>;

// ─── Skill Cards Config ───────────────────────────────────────────────────────

const SKILL_CARDS: {
  value: DandiayaSkillLevel;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
}[] = [
  {
    value: 'professional',
    emoji: '🥁',
    title: 'Professional',
    subtitle: 'Will teach others',
    color: 'border-accent-marigold text-accent-marigold',
    bg: 'bg-accent-marigold/10',
  },
  {
    value: 'chaos_merchant',
    emoji: '🌀',
    title: 'Chaos Merchant',
    subtitle: 'I go where the music takes me',
    color: 'border-accent-pink text-accent-pink',
    bg: 'bg-accent-pink/10',
  },
  {
    value: 'left_right_struggler',
    emoji: '👟',
    title: 'Left/Right Foot',
    subtitle: 'Still figuring it out',
    color: 'border-accent-gold text-accent-gold',
    bg: 'bg-accent-gold/10',
  },
];

const GENDER_OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'non_binary', label: 'Non-binary', emoji: '⚧️' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🙂' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    goNext();
  };

  const handleStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    goNext();
  };

  const handleFinalSubmit = async (skip = false) => {
    if (!step1Data || !step2Data) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...step1Data,
        ...step2Data,
        profilePicture: skip ? undefined : profilePicture || undefined,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'Registration failed');
        return;
      }

      toast.success('Account created! 🎉 Sign in to start!');
      router.push('/login');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Progress Bar */}
      <ProgressBar current={step} total={totalSteps} />

      {/* Step Label */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">
            Step {step} of {totalSteps}
          </p>
          <h2 className="text-xl font-bold text-text-primary mt-0.5">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Your Festival Profile'}
            {step === 3 && 'Profile Picture'}
          </h2>
        </div>
        {step > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1Form key="step1" onSubmit={handleStep1Submit} defaults={step1Data} />
        )}
        {step === 2 && (
          <Step2Form key="step2" onSubmit={handleStep2Submit} defaults={step2Data} />
        )}
        {step === 3 && (
          <Step3Upload
            key="step3"
            profilePicture={profilePicture}
            onImageChange={setProfilePicture}
            onSubmit={() => handleFinalSubmit(false)}
            onSkip={() => handleFinalSubmit(true)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Login link */}
      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-accent-marigold hover:text-accent-marigold-light font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-border-primary overflow-hidden">
          <motion.div
            className="h-full bg-gradient-festival rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < current ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Step 1 Form ──────────────────────────────────────────────────────────────

function Step1Form({
  onSubmit,
  defaults,
}: {
  onSubmit: (d: Step1Data) => void;
  defaults: Step1Data | null;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(Step1Schema),
    defaultValues: defaults || undefined,
  });

  const selectedGender = watch('gender');
  const selectedCollege = watch('college');
  const usernameValue = watch('username');

  // Debounced real-time username availability check
  const checkUsername = useCallback(async (value: string) => {
    if (!value || value.length < 3 || !/^[a-z0-9_]+$/.test(value)) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
      const json = await res.json();
      setUsernameStatus(json.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  }, []);

  useEffect(() => {
    setUsernameStatus('idle');
    if (!usernameValue || usernameValue.length < 3) return;
    const timer = setTimeout(() => checkUsername(usernameValue), 600);
    return () => clearTimeout(timer);
  }, [usernameValue, checkUsername]);

  return (
    <motion.form
      key="step1-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Username */}
      <Field label="Username" error={errors.username?.message}>
        <div className="relative">
          <input
            {...register('username')}
            placeholder="your_username"
            className={clsx(
              inputCls(!!errors.username || usernameStatus === 'taken'),
              'pr-10',
              usernameStatus === 'available' && !errors.username && 'border-status-online focus:ring-status-online/50',
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === 'checking' && (
              <div className="w-4 h-4 border-2 border-accent-marigold border-t-transparent rounded-full animate-spin" />
            )}
            {usernameStatus === 'available' && !errors.username && (
              <Check size={16} className="text-status-online" />
            )}
            {usernameStatus === 'taken' && (
              <X size={16} className="text-status-danger" />
            )}
          </div>
        </div>
        {usernameStatus === 'available' && !errors.username && (
          <p className="text-status-online text-xs mt-1">✓ Username is available!</p>
        )}
        {usernameStatus === 'taken' && !errors.username && (
          <p className="text-status-danger text-xs mt-1">✗ Username already taken — try another</p>
        )}
      </Field>

      {/* Name */}
      <Field label="Full Name" error={errors.name?.message}>
        <input
          {...register('name')}
          placeholder="Your name"
          className={inputCls(!!errors.name)}
        />
      </Field>

      {/* Password */}
      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <input
            {...register('password')}
            type={showPw ? 'text' : 'password'}
            placeholder="Min 8 characters"
            className={clsx(inputCls(!!errors.password), 'pr-10')}
          />
          <ToggleEye show={showPw} onToggle={() => setShowPw((v) => !v)} />
        </div>
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password" error={errors.confirmPassword?.message}>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat password"
            className={clsx(inputCls(!!errors.confirmPassword), 'pr-10')}
          />
          <ToggleEye show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </div>
      </Field>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Gender
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setValue('gender', g.value, { shouldValidate: true })}
              className={clsx(
                'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-200',
                selectedGender === g.value
                  ? 'border-accent-marigold bg-accent-marigold/10 text-accent-marigold'
                  : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-border-accent',
              )}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-status-danger text-xs mt-1">{errors.gender.message}</p>
        )}
      </div>

      {/* College */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          College
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLLEGES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('college', c as College, { shouldValidate: true })}
              className={clsx(
                'p-3 rounded-xl border text-sm font-medium transition-all duration-200 text-center',
                selectedCollege === c
                  ? 'border-accent-pink bg-accent-pink/10 text-accent-pink'
                  : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-border-accent',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {errors.college && (
          <p className="text-status-danger text-xs mt-1">{errors.college.message}</p>
        )}
      </div>

      <NextButton />
    </motion.form>
  );
}

// ─── Step 2 Form ──────────────────────────────────────────────────────────────

function Step2Form({
  onSubmit,
  defaults,
}: {
  onSubmit: (d: Step2Data) => void;
  defaults: Step2Data | null;
}) {
  const [hobbyInput, setHobbyInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    defaultValues: defaults || { bio: '', hobbies: [] },
  });

  const hobbies = watch('hobbies') || [];
  const bio = watch('bio') || '';
  const selectedSkill = watch('dandiayaSkillLevel');

  const addHobby = () => {
    const trimmed = hobbyInput.trim();
    if (!trimmed || hobbies.includes(trimmed) || hobbies.length >= 10) return;
    setValue('hobbies', [...hobbies, trimmed], { shouldValidate: true });
    setHobbyInput('');
  };

  const removeHobby = (h: string) => {
    setValue(
      'hobbies',
      hobbies.filter((x) => x !== h),
    );
  };

  return (
    <motion.form
      key="step2-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Age (optional) */}
      <Field label="Age (optional)" error={errors.age?.message}>
        <input
          {...register('age', { valueAsNumber: true })}
          type="number"
          placeholder="17–30"
          min={17}
          max={30}
          className={inputCls(!!errors.age)}
        />
      </Field>

      {/* Instagram ID (optional) */}
      <Field label="Instagram ID (optional)" error={errors.instagramId?.message}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
            @
          </span>
          <input
            {...register('instagramId')}
            placeholder="your_ig_handle"
            className={clsx(inputCls(!!errors.instagramId), 'pl-7')}
          />
        </div>
      </Field>

      {/* Bio */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-text-secondary">Bio</label>
          <span
            className={clsx(
              'text-xs',
              bio.length > 280 ? 'text-status-danger' : 'text-text-muted',
            )}
          >
            {bio.length}/300
          </span>
        </div>
        <textarea
          {...register('bio')}
          rows={3}
          placeholder="Tell others about yourself... ✨"
          className={clsx(
            inputCls(!!errors.bio),
            'resize-none leading-relaxed',
          )}
        />
        {errors.bio && (
          <p className="text-status-danger text-xs mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Hobbies */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Hobbies{' '}
          <span className="text-text-muted font-normal">
            (press Enter to add, max 10)
          </span>
        </label>
        <div className="flex gap-2">
          <input
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addHobby();
              }
            }}
            placeholder="e.g. Dancing, Music..."
            className={clsx(inputCls(false), 'flex-1')}
            disabled={hobbies.length >= 10}
          />
          <button
            type="button"
            onClick={addHobby}
            disabled={!hobbyInput.trim() || hobbies.length >= 10}
            className="px-4 py-2.5 rounded-xl bg-accent-marigold/20 text-accent-marigold border border-accent-marigold/30 hover:bg-accent-marigold/30 transition-colors disabled:opacity-40 text-sm font-medium"
          >
            Add
          </button>
        </div>
        {hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hobbies.map((h) => (
              <span
                key={h}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-secondary border border-border-primary text-text-secondary text-sm"
              >
                {h}
                <button
                  type="button"
                  onClick={() => removeHobby(h)}
                  className="text-text-muted hover:text-status-danger transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dandiya Skill Level */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Dandiya Skill Level
        </label>
        <div className="space-y-2.5">
          {SKILL_CARDS.map((card) => (
            <button
              key={card.value}
              type="button"
              onClick={() =>
                setValue('dandiayaSkillLevel', card.value, {
                  shouldValidate: true,
                })
              }
              className={clsx(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                selectedSkill === card.value
                  ? `${card.color} ${card.bg} shadow-lg`
                  : 'border-border-primary bg-bg-secondary text-text-secondary hover:border-border-accent',
              )}
            >
              <span className="text-3xl">{card.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-xs opacity-70 mt-0.5">{card.subtitle}</p>
              </div>
              {selectedSkill === card.value && (
                <Check size={18} className="flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        {errors.dandiayaSkillLevel && (
          <p className="text-status-danger text-xs mt-1">
            {errors.dandiayaSkillLevel.message}
          </p>
        )}
      </div>

      <NextButton />
    </motion.form>
  );
}

// ─── Step 3 Upload ────────────────────────────────────────────────────────────

function Step3Upload({
  profilePicture,
  onImageChange,
  onSubmit,
  onSkip,
  isSubmitting,
}: {
  profilePicture: string | null;
  onImageChange: (base64: string | null) => void;
  onSubmit: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      const reader = new FileReader();
      reader.onload = () => onImageChange(reader.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      toast.error('Failed to process image. Please try another.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <motion.div
      key="step3"
      className="space-y-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-text-secondary text-sm">
        Add a profile photo so others can recognize you at the event! 🎭
      </p>

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center w-full h-56 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
          profilePicture
            ? 'border-accent-marigold/50'
            : 'border-border-primary hover:border-border-accent',
          isCompressing && 'pointer-events-none opacity-60',
        )}
      >
        {profilePicture ? (
          <>
            <Image
              src={profilePicture}
              alt="Profile preview"
              fill
              className="object-cover rounded-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex flex-col items-center gap-2 text-white">
                <Camera size={24} />
                <span className="text-sm font-medium">Change photo</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-text-muted">
            {isCompressing ? (
              <>
                <Loader2 size={36} className="animate-spin text-accent-marigold" />
                <p className="text-sm">Compressing image...</p>
              </>
            ) : (
              <>
                <Upload size={36} className="text-border-accent" />
                <div className="text-center">
                  <p className="text-sm font-medium text-text-secondary">
                    Click to upload
                  </p>
                  <p className="text-xs mt-1">JPG, PNG or WEBP · Auto-compressed</p>
                </div>
              </>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {profilePicture && (
        <button
          type="button"
          onClick={() => onImageChange(null)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-status-danger transition-colors"
        >
          <X size={14} />
          Remove photo
        </button>
      )}

      {/* Submit / Skip */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-accent transition-all text-sm font-medium disabled:opacity-50"
        >
          Skip for now
        </button>
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || isCompressing}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-festival text-white font-semibold text-sm shadow-marigold hover:shadow-marigold-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check size={16} />
              {profilePicture ? 'Finish & Join' : 'Join GarbaGrid'}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-status-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

function NextButton() {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-marigold text-white font-semibold shadow-marigold hover:shadow-marigold-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-marigold focus:ring-offset-2 focus:ring-offset-bg-card"
    >
      Continue
      <ChevronRight size={18} />
    </motion.button>
  );
}

function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function Eye({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function inputCls(hasError: boolean) {
  return clsx(
    'w-full bg-bg-secondary border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted',
    'focus:outline-none focus:ring-2 focus:ring-accent-marigold/50 focus:border-accent-marigold transition-all duration-200',
    hasError ? 'border-status-danger' : 'border-border-primary',
  );
}
