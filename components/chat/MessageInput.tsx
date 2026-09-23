'use client';

import { useRef, useState, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'image') => Promise<void>;
  onTyping?: () => void;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARS = 500;
const MAX_ROWS = 5;

export function MessageInput({
  onSend,
  onTyping,
  isSending = false,
  disabled = false,
  placeholder = 'Type a message…',
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charsLeft = MAX_CHARS - value.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = value.trim().length === 0;
  const canSend = !isEmpty && !isSending && !disabled && !isOverLimit;

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resizeTextarea();
    onTyping?.();
  };

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const msg = value.trim();
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    await onSend(msg, 'text');
  }, [canSend, value, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border-primary bg-bg-secondary">
      <div
        className={clsx(
          'flex items-end gap-2 rounded-2xl border px-4 py-2 transition-colors',
          disabled
            ? 'border-border-primary opacity-50'
            : 'border-border-accent bg-bg-card focus-within:border-accent-marigold/50'
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          maxLength={MAX_CHARS + 10} // allow slightly over to show warning
          className="flex-1 resize-none bg-transparent text-text-primary placeholder-text-muted text-sm leading-6 outline-none py-1 max-h-[120px] overflow-y-auto"
          style={{ minHeight: '24px' }}
        />

        {/* Character counter (shows below 50) */}
        <AnimatePresence>
          {charsLeft <= 50 && value.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={clsx(
                'text-xs font-mono flex-shrink-0 self-end mb-1',
                isOverLimit ? 'text-status-danger' : charsLeft <= 20 ? 'text-accent-gold' : 'text-text-muted'
              )}
            >
              {charsLeft}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Send button */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className={clsx(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 self-end mb-0.5',
            canSend
              ? 'bg-gradient-marigold text-white shadow-marigold cursor-pointer'
              : 'bg-bg-hover text-text-muted cursor-not-allowed'
          )}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      <p className="text-xs text-text-muted mt-1.5 px-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
