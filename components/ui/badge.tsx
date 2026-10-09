import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none transition-colors [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-ink-200 bg-sand-100 text-ink-700',
        gold: 'border-gold-300 bg-gold-50 text-gold-700',
        ink: 'border-ink-900 bg-ink-900 text-white',
        success: 'border-transparent bg-success-soft text-success',
        warning: 'border-transparent bg-warning-soft text-warning',
        danger: 'border-transparent bg-danger-soft text-danger',
        info: 'border-transparent bg-info-soft text-info',
        outline: 'border-ink-300 bg-white/85 text-ink-800 backdrop-blur-sm',
        demo: 'border-dashed border-warning/60 bg-warning-soft text-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
