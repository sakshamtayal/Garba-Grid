'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';
import CreatorModal from './CreatorModal';

export default function Header() {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left Decorative/Nav Shortcut */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-accent-marigold/30 shadow-marigold flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-icon.jpg" alt="GarbaGrid" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-accent-gold font-bold">Delhi-NCR</span>
              <span className="text-[11px] text-text-muted">Navratri 2026</span>
            </div>
          </div>

          {/* Top Center Branding with "by Saksham Tayal" interactive link */}
          <div className="flex flex-col items-center justify-center">
            <Link href="/discover" className="group flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-festival bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                GarbaGrid
              </h1>
              <Sparkles size={14} className="text-accent-gold animate-pulse" />
            </Link>
            
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="group flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-accent-marigold transition-colors cursor-pointer mt-0.5"
            >
              <span>by</span>
              <span className="font-semibold text-text-secondary group-hover:text-accent-marigold group-hover:underline underline-offset-2 flex items-center gap-0.5">
                Saksham Tayal
                <Heart size={10} className="text-accent-pink group-hover:scale-125 transition-transform" />
              </span>
            </button>
          </div>

          {/* Right Circuit Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-tertiary border border-border-accent text-[11px] text-text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-status-online animate-ping" />
              <span>DTU • NSUT • IGDTUW • IIIT • IIT</span>
            </div>
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-bg-tertiary text-accent-marigold hover:bg-bg-hover transition-colors"
              title="View Creator"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Creator Profile Modal */}
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
      />
    </>
  );
}
