'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RoyalCornerMotif from './RoyalCornerMotif';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'festival' | 'glass' | 'ornate';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  glow?: boolean;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-bg-card border border-border-primary shadow-card',
  festival: 'relative bg-bg-card border-none festival-border',
  glass: 'glass',
  ornate: 'relative bg-bg-card border-2 border-accent-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.15)]',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  variant = 'default',
  padding = 'md',
  glow = false,
  hover = false,
  className,
  children,
  onClick,
}: CardProps) {
  const isInteractive = Boolean(onClick) || hover;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl transition-shadow duration-200 relative overflow-hidden',
        variantStyles[variant],
        paddingStyles[padding],
        glow && 'shadow-marigold',
        isInteractive && 'cursor-pointer hover:shadow-card-hover',
        className
      )}
    >
      {variant === 'ornate' && (
        <>
          <div className="absolute inset-1.5 rounded-[14px] border border-accent-gold/20 pointer-events-none" />
          <RoyalCornerMotif size="sm" variant="gold" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-4 pb-4 border-b border-border-primary flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'text-base font-semibold text-text-primary tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-xs text-text-secondary mt-0.5', className)}>
      {children}
    </p>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-border-primary flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;
