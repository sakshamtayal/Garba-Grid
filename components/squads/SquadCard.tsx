'use client';

import { motion } from 'framer-motion';
import { Users, Copy, Check, MessageSquare, Crown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { ISquad, College, COLLEGE_BG_CLASSES } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SquadCardProps {
  squad: ISquad;
  currentUserId?: string;
  onDisbanded?: (squadId: string) => void;
  index?: number;
}

interface PopulatedMember {
  userId: string | {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    college: College;
  };
  role: 'leader' | 'member';
}

function MemberAvatar({ member, size = 'md' }: { member: PopulatedMember; size?: 'sm' | 'md' }) {
  const user = typeof member.userId === 'object' ? member.userId : null;
  const initials = user?.name?.slice(0, 1).toUpperCase() ?? '?';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
  const college = user?.college as College | undefined;

  return (
    <div
      title={user?.name ?? 'Member'}
      className={clsx(
        'rounded-full border-2 border-bg-card flex items-center justify-center font-bold flex-shrink-0 relative',
        sizeClass,
        college ? COLLEGE_BG_CLASSES[college] : 'bg-bg-secondary text-text-secondary border-border-primary'
      )}
    >
      {user?.profilePicture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
      {member.role === 'leader' && (
        <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
      )}
    </div>
  );
}

export function SquadCard({ squad, currentUserId, onDisbanded, index = 0 }: SquadCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [disbanding, setDisbanding] = useState(false);

  const isLeader = squad.members.some(
    (m) => {
      const uid = typeof m.userId === 'object' ? m.userId._id : m.userId;
      return uid === currentUserId && m.role === 'leader';
    }
  );

  const fullInviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${squad.inviteLink}`
    : squad.inviteLink;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite link copied!');
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Join my Garba squad "${squad.name}" on GarbaGrid! 💃\n${fullInviteUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleDisband = async () => {
    if (!confirm(`Disband "${squad.name}"? This cannot be undone.`)) return;
    setDisbanding(true);
    try {
      const res = await fetch(`/api/squads/${squad._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Squad disbanded');
      onDisbanded?.(squad._id);
    } catch {
      toast.error('Failed to disband squad');
    } finally {
      setDisbanding(false);
    }
  };

  const displayMembers = squad.members.slice(0, 4);
  const overflow = Math.max(0, squad.members.length - 4);

  // Collect unique colleges
  const colleges = Array.from(
    new Set(
      squad.members
        .map((m) => (typeof m.userId === 'object' ? m.userId.college : null))
        .filter(Boolean) as College[]
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="bg-bg-card border border-border-primary rounded-2xl p-5 space-y-4 hover:border-accent-marigold/40 hover:shadow-card-hover transition-all duration-300 group"
    >
      {/* Squad name & member count */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-marigold" />
            <h3 className="font-bold text-text-primary group-hover:text-accent-marigold transition-colors">
              {squad.name}
            </h3>
          </div>
          <p className="text-xs text-text-secondary">{squad.members.length} member{squad.members.length !== 1 ? 's' : ''}</p>
        </div>
        {isLeader && (
          <div className="flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-xs text-accent-gold font-medium">Leader</span>
          </div>
        )}
      </div>

      {/* Member avatars */}
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {displayMembers.map((m, i) => (
            <MemberAvatar key={i} member={m as PopulatedMember} size="sm" />
          ))}
          {overflow > 0 && (
            <div className="w-7 h-7 rounded-full border-2 border-bg-card bg-bg-secondary flex items-center justify-center text-[10px] text-text-secondary font-medium">
              +{overflow}
            </div>
          )}
        </div>
      </div>

      {/* College badges */}
      {colleges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {colleges.map((college) => (
            <span key={college} className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium', COLLEGE_BG_CLASSES[college])}>
              {college}
            </span>
          ))}
        </div>
      )}

      {/* Invite link */}
      <div className="bg-bg-secondary rounded-xl p-3 flex items-center gap-2">
        <span className="text-xs text-text-muted truncate flex-1 font-mono">{squad.inviteCode}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-bg-hover text-text-secondary hover:text-accent-marigold transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push('/chat')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent-marigold/10 text-accent-marigold border border-accent-marigold/20 hover:bg-accent-marigold/20 transition-colors text-sm font-medium"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Open Chat
        </button>
        <button
          onClick={handleWhatsApp}
          className="py-2 px-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
          title="Share on WhatsApp"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
        {isLeader && (
          <button
            onClick={handleDisband}
            disabled={disbanding}
            className="py-2 px-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            title="Disband squad"
          >
            {disbanding ? (
              <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
