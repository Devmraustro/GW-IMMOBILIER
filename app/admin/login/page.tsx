import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { AdminLoginForm } from '@/components/dashboard/admin-login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion administrateur | GW Immobilier',
  description: 'Connexion sécurisée à l’espace d’administration de GW Immobilier.',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="container-page py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-panel sm:p-8">
          <div className="mb-8">
            <Logo />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
              GW Immobilier Pro
            </p>
          </div>
          <AdminLoginForm />
          <p className="mt-6 border-t border-ink-100 pt-5 text-xs leading-relaxed text-ink-400">
            Accès réservé aux personnes autorisées. Les identifiants doivent être configurés dans les variables privées du serveur.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex text-sm font-medium text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
          >
            ← Retour au site
          </Link>
        </div>
      </div>
    </section>
  );
}
