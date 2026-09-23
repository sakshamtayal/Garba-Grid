'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Compass,
  Calendar,
  Ticket,
  MessageCircle,
  Shield,
  ArrowRight,
  Heart,
  ChevronRight,
  Flame,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import CreatorModal from '@/components/layout/CreatorModal';
import OrnateDivider from '@/components/ui/OrnateDivider';
import RoyalCornerMotif from '@/components/ui/RoyalCornerMotif';

export default function LandingPage() {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const colleges = [
    { name: 'DTU', color: 'bg-blue-100/90 text-blue-900 border-blue-300' },
    { name: 'NSUT', color: 'bg-emerald-100/90 text-emerald-900 border-emerald-300' },
    { name: 'IGDTUW', color: 'bg-fuchsia-100/90 text-fuchsia-900 border-fuchsia-300' },
    { name: 'NIT Delhi', color: 'bg-cyan-100/90 text-cyan-900 border-cyan-300' },
    { name: 'IIIT Delhi', color: 'bg-amber-100/90 text-amber-900 border-amber-300' },
    { name: 'IIT Delhi', color: 'bg-rose-100/90 text-rose-900 border-rose-300' },
    { name: 'Delhi University (DU)', color: 'bg-purple-100/90 text-purple-900 border-purple-300' },
    { name: 'IPU', color: 'bg-indigo-100/90 text-indigo-900 border-indigo-300' },
  ];

  const features = [
    {
      icon: '💃',
      title: 'Pass or Connect Matchmaking',
      desc: 'Discover Dandiya partners and squad mates with Dandiya skill tags, college filters, and gated mutual-connect chats.',
    },
    {
      icon: '🪅',
      title: 'Campus & Festive Group Chats',
      desc: 'Pre-built, persistent chat channels for DTU, NSUT, IGDTUW, IIIT, DU, IPU, Girls Corner, Boys Zone, and Navratri hype rooms.',
    },
    {
      icon: '🎯',
      title: 'Live Attendance Radar',
      desc: 'Real-time Delhi Dandiya event directory with live breakdown charts of how many students from each college are attending.',
    },
    {
      icon: '🎟️',
      title: 'Extra Passes Board',
      desc: 'Buy, sell, or trade spare passes directly with verified students across Delhi-NCR colleges.',
    },
    {
      icon: '🤫',
      title: 'Anonymous Confession Hub',
      desc: '100% anonymous campus feed for festival hype, outfit appreciation, and secret Dandiya shout-outs.',
    },
    {
      icon: '🤝',
      title: 'Squad WhatsApp Links',
      desc: 'Generate instant WhatsApp invite links to bundle your college gang into a shared squad profile.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-marigold selection:text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience Radiance */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-marigold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-accent-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-accent-gold/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-bg-card/90 backdrop-blur-md border-b border-border-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-accent-gold shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-icon.jpg" alt="GarbaGrid" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold bg-gradient-festival bg-clip-text text-transparent">
              GarbaGrid
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-marigold transition-colors"
            >
              <span>by</span>
              <span className="font-semibold text-text-primary flex items-center gap-1">
                Saksham Tayal <Heart size={10} className="text-accent-pink fill-accent-pink" />
              </span>
            </button>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="shadow-marigold">
                Join Circle ✨
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 text-center flex flex-col items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-card border border-accent-gold/50 text-accent-marigold text-xs font-semibold mb-6 shadow-sm"
        >
          <Sparkles size={14} className="text-accent-gold" />
          <span>The Delhi-NCR College Dandiya & Squad Circuit 🪅</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-text-primary"
        >
          Find Your <br className="hidden sm:block" />
          <span className="bg-gradient-festival bg-clip-text text-transparent">
            Dandiya Match & Squad
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed font-medium"
        >
          The dedicated Navratri matchmaking, group chat, and event utility hub for{' '}
          <span className="text-text-primary font-bold">DTU, NSUT, IGDTUW, IIIT & IIT</span>.
          Connect with dance partners, check who’s going where, and trade extra passes safely.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-marigold-lg flex items-center justify-center gap-2 text-base px-8 py-3.5"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2 text-base px-8 py-3.5 bg-bg-card"
            >
              <span>Enter Campus Hub</span>
            </Button>
          </Link>
        </motion.div>

        {/* Hero Visual Card Showcase — Festive Parchment Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 w-full max-w-4xl relative rounded-3xl overflow-hidden border-2 border-accent-gold/60 shadow-xl group bg-bg-card p-2"
        >
          <div className="relative rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-banner.jpg"
              alt="GarbaGrid Delhi-NCR Navratri Dandiya Night 2026"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>

        {/* College badges ticker */}
        <div className="mt-14 w-full">
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
            Active Delhi-NCR College Communities
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {colleges.map((c) => (
              <div
                key={c.name}
                className={`px-4 py-2 rounded-2xl ${c.color} border text-xs font-bold shadow-sm`}
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Ornate Indian Festive Divider */}
        <OrnateDivider className="mt-14" />
      </section>

      {/* Feature Grid with Festive Parchment Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
            Everything You Need for Dandiya Season 🌟
          </h2>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            Built specifically for college students during Navratri hype nights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-3xl bg-bg-card border border-border-primary hover:border-accent-gold/60 transition-all shadow-card hover:shadow-card-hover flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-2xl mb-4 border border-border-accent/40 shadow-sm group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-normal">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Traditional Pichwai Art Feature Highlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl bg-bg-card border-2 border-accent-gold/60 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <RoyalCornerMotif size="md" variant="gold" />
          
          <div className="w-48 sm:w-56 h-64 rounded-2xl overflow-hidden border border-accent-gold/50 shadow-md flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pichwai-tree-peacock.jpg"
              alt="Kalpavriksha Tree & Peacocks"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-marigold/10 text-accent-marigold text-xs font-bold border border-accent-marigold/20 mb-3">
              <Sparkles size={12} /> Royal Indian Festival Heritage
            </span>
            <h3 className="text-2xl font-black text-text-primary">
              Celebrate Navratri 2026 in Grand Festive Style
            </h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              From high-energy Garba circles to midnight Dandiya raas across Leisure Valley, JLN Stadium, and campus grounds — connect with partners who match your rhythm.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="/register">
                <Button variant="primary" size="md" className="shadow-marigold">
                  Find Your Match 💃
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="md">
                  Explore Events 🎟️
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Branding */}
      <footer className="w-full bg-bg-card border-t border-border-primary py-8 px-4 sm:px-6 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪅</span>
            <span className="font-bold text-text-primary text-base">GarbaGrid</span>
          </div>
          <button
            onClick={() => setIsCreatorModalOpen(true)}
            className="text-xs text-text-muted hover:text-accent-marigold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Designed & Engineered with</span>
            <Heart size={12} className="text-accent-pink fill-accent-pink" />
            <span>by Saksham Tayal</span>
          </button>
          <p className="text-[11px] text-text-muted mt-2">
            © 2026 GarbaGrid. Delhi-NCR Navratri Festival Hub.
          </p>
        </div>
      </footer>

      {/* Creator Modal */}
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
      />
    </div>
  );
}
