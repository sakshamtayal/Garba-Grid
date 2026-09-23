'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import clsx from 'clsx';

// ─── Schema ───────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof LoginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/discover';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username: data.username.toLowerCase().trim(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin'
          ? 'Invalid username or password'
          : result.error,
        );
        return;
      }

      toast.success('Welcome back! 🎊');
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Heading */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
        <p className="text-text-secondary text-sm mt-1">
          Sign in to find your Dandiya partner 💃
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Username */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Username
          </label>
          <input
            {...register('username')}
            type="text"
            autoComplete="username"
            placeholder="your_username"
            disabled={isLoading}
            className={clsx(
              'w-full bg-bg-secondary border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-accent-marigold/50 focus:border-accent-marigold',
              'transition-all duration-200 disabled:opacity-50',
              errors.username ? 'border-status-danger' : 'border-border-primary',
            )}
          />
          {errors.username && (
            <p className="text-status-danger text-xs mt-1">{errors.username.message}</p>
          )}
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              className={clsx(
                'w-full bg-bg-secondary border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-accent-marigold/50 focus:border-accent-marigold',
                'transition-all duration-200 disabled:opacity-50',
                errors.password ? 'border-status-danger' : 'border-border-primary',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-status-danger text-xs mt-1">{errors.password.message}</p>
          )}
        </motion.div>

        {/* Remember Me */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 rounded border-border-primary bg-bg-secondary accent-accent-marigold cursor-pointer"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={() =>
              toast('Contact admin: @saksham_tayal on Instagram 📸', {
                icon: '🔑',
              })
            }
            className="text-sm text-accent-marigold hover:text-accent-marigold-light transition-colors"
          >
            Forgot password?
          </button>
        </motion.div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white',
            'bg-gradient-marigold hover:shadow-marigold-lg transition-all duration-200',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-accent-marigold focus:ring-offset-2 focus:ring-offset-bg-card',
          )}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <DandiyaLoaderText />
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign in
            </>
          )}
        </motion.button>
      </form>

      {/* Register link */}
      <motion.p
        className="text-center text-sm text-text-secondary mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-accent-marigold hover:text-accent-marigold-light font-semibold transition-colors"
        >
          Register for Navratri 🎉
        </Link>
      </motion.p>
    </div>
  );
}

// ─── Dandiya Loader Text ──────────────────────────────────────────────────────

function DandiyaLoaderText() {
  const messages = [
    'Tuning the dhol...',
    'Finding your beat...',
    'Signing you in...',
  ];
  const msg = messages[Math.floor(Date.now() / 1000) % messages.length];
  return <span>{msg}</span>;
}
