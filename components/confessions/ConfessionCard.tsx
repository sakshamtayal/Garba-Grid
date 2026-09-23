'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Flag, Sparkles, Clock, MoreVertical, MessageCircle } from 'lucide-react';
import { Confession } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ConfessionCardProps {
  confession: Confession;
  currentUserId?: string;
  onReport?: (id: string) => void;
}

export default function ConfessionCard({ confession, currentUserId, onReport }: ConfessionCardProps) {
  const [likes, setLikes] = useState<string[]>(confession.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Please log in to like confessions');
      return;
    }
    try {
      setIsLiking(true);
      if (hasLiked) {
        setLikes(likes.filter((id) => id !== currentUserId));
      } else {
        setLikes([...likes, currentUserId]);
      }
      await axios.post(`/api/confessions/${confession._id}/like`);
    } catch {
      // Revert if failed
      setLikes(confession.likes || []);
      toast.error('Failed to update reaction.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportAction = async () => {
    setShowMenu(false);
    try {
      await axios.post(`/api/confessions/${confession._id}/report`, {
        reason: 'Inappropriate or harmful content',
      });
      toast.success('Post reported for moderation review');
      if (onReport) onReport(confession._id);
    } catch {
      toast.error('Failed to report post.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border-primary hover:border-accent-pink/40 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 relative group flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Anonymous Mask & College */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-pink/30 to-accent-marigold/30 border border-accent-pink/40 flex items-center justify-center text-sm shadow-inner">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-primary">
                  {confession.isAnonymous ? 'Anonymous Garba Lover' : 'Festive Student'}
                </span>
                <span className="text-[10px] text-text-muted">•</span>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock size={10} />
                  {confession.createdAt
                    ? formatDistanceToNow(new Date(confession.createdAt), { addSuffix: true })
                    : 'recently'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 relative">
            {confession.college && (
              <Badge variant="college" college={confession.college as any} size="sm">
                {confession.college}
              </Badge>
            )}

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 z-20 w-36 bg-bg-secondary border border-border-primary rounded-xl shadow-xl py-1">
                <button
                  onClick={handleReportAction}
                  className="w-full px-3 py-1.5 text-left text-xs text-status-danger hover:bg-bg-hover flex items-center gap-2"
                >
                  <Flag size={12} />
                  <span>Report Post</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap font-sans my-3 bg-bg-secondary/40 p-3.5 rounded-xl border border-border-accent/30">
          "{confession.content}"
        </p>
      </div>

      {/* Bottom actions: Likes and hype */}
      <div className="pt-2 border-t border-border-primary/60 flex items-center justify-between mt-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            hasLiked
              ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/40 shadow-sm'
              : 'text-text-muted hover:text-accent-pink hover:bg-accent-pink/10'
          }`}
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart size={14} className={hasLiked ? 'fill-accent-pink text-accent-pink' : ''} />
          </motion.div>
          <span>{likes.length} {likes.length === 1 ? 'Hype' : 'Hypes'}</span>
        </button>

        <span className="text-[11px] text-text-muted flex items-center gap-1">
          <Sparkles size={12} className="text-accent-gold" />
          <span>Navratri Hype Feed</span>
        </span>
      </div>
    </motion.div>
  );
}
