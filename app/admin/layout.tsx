import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export const metadata: Metadata = {
  title: 'Administration (démonstration)',
  description:
    'Tableau de bord de démonstration : biens, véhicules, demandes, réservations et suivi financier. Aucune authentification n’est active.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
