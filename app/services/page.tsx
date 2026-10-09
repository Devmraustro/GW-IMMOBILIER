import type { Metadata } from 'next';
import { ServicesContent } from '@/components/pages/services-content';
import { services } from '@/data/services';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = {
  title: 'Nos services — location, vente, meublés, véhicules, échange',
  description:
    'Location et vente immobilière, meublés de courte durée, échange de biens, location de véhicules et assistance administrative dans la wilaya d’Alger.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  const dictionary = getDictionary('fr');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Location et vente immobilière, location de véhicules',
    provider: { '@type': 'LocalBusiness', name: 'GW Immobilier', areaServed: 'Wilaya d’Alger' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: dictionary.services.title,
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: service.title.fr },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesContent />
    </>
  );
}
