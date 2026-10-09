import type { Metadata } from 'next';
import { ContactContent } from '@/components/pages/contact-content';

export const metadata: Metadata = {
  title: 'Nous contacter — GW Immobilier',
  description:
    'Contactez GW Immobilier par formulaire, téléphone ou WhatsApp pour une location, un achat, un meublé ou une location de véhicule dans la wilaya d’Alger.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <ContactContent />;
}
