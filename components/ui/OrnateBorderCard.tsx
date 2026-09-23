'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import RoyalCornerMotif from './RoyalCornerMotif';

interface OrnateBorderCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  cornerSize?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'festival';
}

export function OrnateBorderCard({
  children,
  className,
  glow = true,
  cornerSize = 'md',
  variant = 'gold',
  ...props
}: OrnateBorderCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-3xl p-6 bg-bg-card/90 backdrop-blur-md overflow-hidden',
        // Ornate double border styling with gold & festival gradient
        'border-2 border-accent-gold/40',
        'shadow-card hover:shadow-card-hover transition-all duration-300',
        glow && 'shadow-[0_0_25px_rgba(212,175,55,0.15)] hover:shadow-[0_0_35px_rgba(255,140,0,0.25)]',
        className
      )}
      {...props}
    >
      {/* Inner thin decorative gold hairline frame */}
      <div className="absolute inset-1.5 rounded-[22px] border border-accent-gold/20 pointer-events-none" />

      {/* Traditional Ornate Filigree Corners */}
      <RoyalCornerMotif size={cornerSize} variant={variant} />

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}

export default OrnateBorderCard;
