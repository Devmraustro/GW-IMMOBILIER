import type { Metadata } from 'next';
import { properties } from '@/data/properties';
import { getArea } from '@/data/areas';
import { PropertyDetail } from '@/components/properties/property-detail';

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) {
    return {
      title: 'Bien introuvable',
      description: 'Cette annonce n’existe pas ou a été retirée.',
      robots: { index: false },
    };
  }

  const area = getArea(property.area);
  const title = property.title.fr;

  return {
    title,
    description: `${property.description.fr.slice(0, 155)}…`,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: `${title} — ${area?.name.fr ?? 'Alger'}`,
      description: property.description.fr.slice(0, 200),
      images: property.images[0] ? [{ url: property.images[0] }] : undefined,
      type: 'article',
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PropertyDetail slug={slug} />;
}
