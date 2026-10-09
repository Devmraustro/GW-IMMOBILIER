import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Reveal from './reveal';

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = 'start',
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: 'start' | 'center';
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl font-semibold leading-tight sm:text-[2.25rem]">
          {title}
        </h2>
        <div className="gold-rule my-4" aria-hidden />
        {text ? <p className="text-base leading-relaxed text-ink-500">{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}

export default SectionHeading;
