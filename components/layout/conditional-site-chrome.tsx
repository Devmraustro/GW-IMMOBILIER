'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export function ConditionalSiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/cesar-immo')) return null;
  return <SiteHeader />;
}

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/cesar-immo')) return null;
  return <SiteFooter />;
}
