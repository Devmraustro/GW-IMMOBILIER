'use client';

import * as Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { imageFallback } from '@/lib/images';

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallback?: string;
  seed?: number;
  fallbackKind?: 'property' | 'vehicle' | 'hero';
}

/**
 * Image with a guaranteed local fallback.
 *
 * Photography is remote; if a file is unreachable (offline, blocked CDN, 404)
 * we swap in locally stored SVG artwork so the layout never breaks or shows a
 * broken-image icon.
 */
export function SmartImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  fallback,
  seed = 0,
  fallbackKind = 'property',
}: SmartImageProps) {
  const [current, setCurrent] = useState(src);
  const [isFallback, setIsFallback] = useState(false);

  const handleError = () => {
    if (isFallback) return;
    setIsFallback(true);
    setCurrent(fallback ?? imageFallback(fallbackKind, seed));
  };

  const shared = {
    src: current,
    alt,
    className: cn('object-cover', className),
    onError: handleError,
    priority,
    sizes: fill ? sizes : undefined,
    unoptimized: true,
  } as const;

  if (fill) {
    return <Image.default {...shared} fill />;
  }

  return <Image.default {...shared} width={width ?? 800} height={height ?? 600} />;
}

export default SmartImage;
