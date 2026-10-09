'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...props }, ref) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-ink-100">
        <SliderPrimitive.Range className="absolute h-full bg-gold-400" />
      </SliderPrimitive.Track>
      {(props.value ?? props.defaultValue ?? [0]).map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            'block size-4 rounded-full border-2 border-gold-400 bg-white shadow-sm transition-transform',
            'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
