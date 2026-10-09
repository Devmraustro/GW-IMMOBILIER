import type { Metadata } from 'next';
import { AboutContent } from '@/components/pages/about-content';

export const metadata: Metadata = {
  title: 'À propos — GW Immobilier, Alger',
  description:
    'GW Immobilier : agence de proximité couvrant neuf communes de la wilaya d’Alger pour la location, la vente, les meublés et la location de véhicules.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutContent />;
}
