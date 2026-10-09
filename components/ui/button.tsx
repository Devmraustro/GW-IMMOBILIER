'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-premium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gold-400 text-ink-900 shadow-sm hover:bg-gold-300 hover:shadow-gold active:bg-gold-500',
        ink: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700',
        outline:
          'border border-ink-300 bg-white text-ink-900 hover:border-ink-900 hover:bg-ink-50',
        outlineLight:
          'border border-white/40 bg-white/5 text-white backdrop-blur-[2px] hover:bg-white/15 hover:border-white/70',
        ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
        subtle: 'bg-sand-100 text-ink-800 hover:bg-sand-200',
        whatsapp: 'bg-[#25D366] text-[#062C15] hover:bg-[#1ebc58] shadow-sm',
        danger: 'bg-danger text-white hover:bg-danger/90',
        link: 'text-gold-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs [&_svg]:size-4',
        md: 'h-11 px-5 text-sm [&_svg]:size-[18px]',
        lg: 'h-[3.25rem] px-7 text-base [&_svg]:size-5',
        icon: 'h-10 w-10 [&_svg]:size-[18px]',
        iconSm: 'h-8 w-8 [&_svg]:size-4',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, fullWidth, asChild = false, loading = false, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

export { buttonVariants };
