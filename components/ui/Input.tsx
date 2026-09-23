'use client';

import * as React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Override right icon slot — takes priority over password toggle */
  rightElement?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightElement,
      className,
      type,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id ?? React.useId();
    const isPassword = type === 'password';
    const resolvedType = isPassword && showPassword ? 'text' : type;

    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span
              className={cn(
                'absolute left-3 flex items-center justify-center',
                'text-text-muted pointer-events-none'
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            className={cn(
              // Base
              'w-full bg-bg-secondary text-text-primary placeholder:text-text-muted',
              'rounded-xl border border-border-primary',
              'py-2.5 text-sm transition-all duration-200',
              // Padding accounting for icons
              leftIcon ? 'pl-10' : 'pl-4',
              isPassword || rightIcon || rightElement ? 'pr-10' : 'pr-4',
              // Focus state — marigold ring
              'focus:outline-none focus:border-accent-marigold focus:ring-2 focus:ring-accent-marigold/20',
              // Error state
              hasError &&
                'border-status-danger focus:border-status-danger focus:ring-status-danger/20',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />

          {/* Right slot: custom element > password toggle > rightIcon */}
          <span className="absolute right-3 flex items-center justify-center">
            {rightElement ? (
              rightElement
            ) : isPassword ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : hasError ? (
              <AlertCircle className="h-4 w-4 text-status-danger" />
            ) : rightIcon ? (
              <span className="text-text-muted pointer-events-none">
                {rightIcon}
              </span>
            ) : null}
          </span>
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-status-danger flex items-center gap-1"
          >
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !hasError && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── Textarea variant ─────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          rows={4}
          className={cn(
            'w-full bg-bg-secondary text-text-primary placeholder:text-text-muted',
            'rounded-xl border border-border-primary',
            'px-4 py-3 text-sm resize-y min-h-[100px]',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent-marigold focus:ring-2 focus:ring-accent-marigold/20',
            hasError && 'border-status-danger focus:border-status-danger',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {hasError && (
          <p role="alert" className="text-xs text-status-danger">
            {error}
          </p>
        )}
        {hint && !hasError && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;

