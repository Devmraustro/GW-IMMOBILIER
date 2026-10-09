import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n';
import { DemoStoreProvider } from '@/lib/demo-store';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { company } from '@/data/company';

export const metadata: Metadata = {
  metadataBase: new URL('https://gw-immobilier-platform.vercel.app'),
  title: {
    default: 'GW Immobilier — Location, vente et véhicules à Alger',
    template: '%s | GW Immobilier',
  },
  description:
    'GW Immobilier : location, vente et gestion immobilière, meublés de courte durée et location de véhicules dans la wilaya d’Alger. Carte interactive, filtres et demandes WhatsApp.',
  keywords: [
    'immobilier Alger',
    'location appartement Alger',
    'F2 Alger',
    'F3 Alger',
    'location meublée Alger',
    'location voiture Alger',
    'Bab Ezzouar',
    'Chéraga',
    'Draria',
    'Dely Ibrahim',
    'Douaouda Marine',
    'Bordj El Kiffan',
    'Ouled Fayet',
    'Dar El Beida',
  ],
  authors: [{ name: 'GW Immobilier' }],
  openGraph: {
    title: 'GW Immobilier — Location, vente et véhicules à Alger',
    description: company.positioning.fr,
    type: 'website',
    locale: 'fr_DZ',
    siteName: 'GW Immobilier',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1B1B1D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-white">
        <I18nProvider>
          <DemoStoreProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
            >
              Aller au contenu principal · الانتقال إلى المحتوى الرئيسي
            </a>
            <SiteHeader />
            <main id="main" className="min-h-[60vh]">
              {children}
            </main>
            <SiteFooter />
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{ className: 'font-sans' }}
            />
          </DemoStoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
