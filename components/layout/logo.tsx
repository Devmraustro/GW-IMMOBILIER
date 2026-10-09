import { cn } from '@/lib/utils';

/**
 * GW monogram. Inline SVG so it is crisp at any size, needs no network request
 * and inherits the current text colour where useful.
 */
export function Logo({
  className,
  variant = 'default',
  showWordmark = true,
}: {
  className?: string;
  variant?: 'default' | 'light' | 'gold';
  showWordmark?: boolean;
}) {
  const monogramBg =
    variant === 'light' ? 'bg-white/12 ring-1 ring-inset ring-white/25' : 'bg-ink-900';
  const monogramText = variant === 'light' ? 'text-white' : 'text-gold-400';
  const wordClass =
    variant === 'light'
      ? 'text-white'
      : variant === 'gold'
        ? 'text-gold-400'
        : 'text-ink-900';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold tracking-tight',
          monogramBg,
          monogramText,
        )}
        aria-hidden
      >
        GW
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-[15px] font-semibold tracking-tight', wordClass)}>
            GW Immobilier
          </span>
          <span
            className={cn(
              'mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em]',
              variant === 'light' ? 'text-white/60' : 'text-ink-400',
            )}
          >
            Alger · Immobilier & Auto
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
