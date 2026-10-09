import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = 'text', ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-sm text-ink-900 shadow-sm transition-colors',
          'placeholder:text-ink-400',
          'focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40',
          'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:opacity-70',
          'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[112px] w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition-colors',
        'placeholder:text-ink-400',
        'focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40',
        'disabled:cursor-not-allowed disabled:bg-ink-50',
        'aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  );
});

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
      {children}
    </p>
  );
}
