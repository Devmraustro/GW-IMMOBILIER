import { cn } from '@/lib/utils';

export function PropertyCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card',
        variant === 'list' && 'sm:flex',
      )}
      aria-hidden
    >
      <div className={cn('skeleton', variant === 'list' ? 'h-48 sm:h-auto sm:w-[320px]' : 'aspect-[4/3]')} />
      <div className="flex-1 space-y-3 p-5">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-5 w-4/5 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-3 w-14 rounded" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

export default PropertyCardSkeleton;
