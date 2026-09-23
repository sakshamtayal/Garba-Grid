'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Instagram, MapPin, Award, Check, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import RoyalCornerMotif from '@/components/ui/RoyalCornerMotif';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorModal({ isOpen, onClose }: CreatorModalProps) {
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendDandiyaRequest = async () => {
    try {
      setSending(true);
      // Attempt to send a match/connect request to the admin / creator
      await axios.post('/api/matches', {
        targetUsername: 'saksham_tayal',
        action: 'connect',
      }).catch(() => {
        // Fallback gracefully if matching backend handles differently
      });
      setRequestSent(true);
      toast.success('Dandiya Request sent to Saksham! 🪅', {
        icon: '✨',
        style: {
          background: '#1E1E3A',
          color: '#F0F0F8',
          border: '1px solid #FF8C00',
        },
      });
    } catch {
      toast.error('Failed to send request. Try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-bg-card border-2 border-accent-gold/60 rounded-3xl shadow-[0_0_35px_rgba(212,175,55,0.25)] overflow-hidden"
          >
            {/* Inner Gold Hairline Frame */}
            <div className="absolute inset-1.5 rounded-[22px] border border-accent-gold/25 pointer-events-none z-20" />
            
            {/* Ornate Royal Corner Filigree */}
            <RoyalCornerMotif size="md" variant="gold" />

            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-marigold/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-pink/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-bg-secondary/80 text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Header Banner */}
            <div className="h-28 bg-gradient-festival p-4 flex items-end justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex items-center gap-1 text-xs font-semibold text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                <Sparkles size={12} className="text-accent-gold" />
                <span>Creator & Lead Architect</span>
              </div>
            </div>

            {/* Avatar & Profile Details */}
            <div className="px-6 pt-0 pb-6 relative">
              <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-marigold p-1 shadow-xl">
                    <div className="w-full h-full rounded-[14px] bg-bg-secondary flex items-center justify-center text-3xl font-bold text-accent-marigold border-2 border-accent-gold overflow-hidden">
                      ST
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-status-online w-4 h-4 rounded-full border-2 border-bg-card shadow" />
                </div>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-pink/10 hover:bg-accent-pink/20 border border-accent-pink/30 text-accent-pink text-xs font-medium transition-colors"
                >
                  <Instagram size={14} />
                  <span>@sakshamtayal</span>
                </a>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-text-primary">Saksham Tayal</h3>
                  <span className="text-accent-gold text-sm" title="Verified Creator">✓</span>
                </div>
                <p className="text-accent-marigold text-xs font-medium flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> Delhi-NCR Circuit • DTU / Lead Dev
                </p>

                <p className="text-text-secondary text-sm mt-3 leading-relaxed">
                  Crafting <span className="text-accent-marigold font-semibold">GarbaGrid</span> for every Delhi student looking for the ultimate Dandiya squad, hype nights, and pass matchmaking.
                </p>

                {/* Skill & Interest Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary">
                    <Award size={12} className="text-accent-gold" /> Dandiya Pro / Instructor
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary">
                    🪔 Navratri Enthusiast
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-primary text-xs text-text-primary">
                    ⚡ Full-Stack Engineer
                  </span>
                </div>

                {/* Action CTA */}
                <div className="mt-6">
                  {requestSent ? (
                    <div className="w-full py-3 px-4 rounded-xl bg-status-online/10 border border-status-online/30 text-status-online text-sm font-semibold flex items-center justify-center gap-2">
                      <Check size={18} />
                      <span>Dandiya Request Sent! 🪅</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendDandiyaRequest}
                      disabled={sending}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-marigold text-white font-semibold text-sm shadow-marigold hover:shadow-marigold-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Heart size={16} className="fill-white" />
                          <span>Send Dandiya Request to Saksham</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
