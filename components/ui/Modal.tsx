'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
  /** Hide the header (no title, no close button) */
  hideHeader?: boolean;
  /** Prevent closing when clicking the backdrop */
  preventBackdropClose?: boolean;
  className?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] sm:max-w-[90vw]',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  hideHeader = false,
  preventBackdropClose = false,
  className,
}: ModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={preventBackdropClose ? undefined : onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
            }}
            className={cn(
              'relative w-full z-10',
              'bg-bg-card border border-border-primary',
              'rounded-2xl shadow-card',
              'flex flex-col max-h-[90dvh]',
              sizeMap[size],
              className
            )}
          >
            {/* Header */}
            {!hideHeader && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
                {title ? (
                  <h2 className="text-lg font-semibold text-text-primary">
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className={cn(
                    'p-1.5 rounded-lg text-text-muted',
                    'hover:text-text-primary hover:bg-bg-hover',
                    'transition-colors duration-150'
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Convenience sub-components ───────────────────────────────────────────────

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border-primary shrink-0',
        'flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;

