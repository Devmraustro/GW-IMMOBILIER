import type { Metadata } from 'next';
import { vehicles } from '@/data/vehicles';
import { CarDetail } from '@/components/cars/car-detail';

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = vehicles.find((item) => item.slug === slug);

  if (!vehicle) {
    return {
      title: 'Véhicule introuvable',
      robots: { index: false },
    };
  }

  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — location à Alger`,
    description: `${vehicle.description.fr.slice(0, 155)}…`,
    alternates: { canonical: `/cars/${vehicle.slug}` },
    openGraph: {
      title: `${vehicle.brand} ${vehicle.model}`,
      description: vehicle.description.fr.slice(0, 200),
      images: vehicle.images[0] ? [{ url: vehicle.images[0] }] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CarDetail slug={slug} />;
}
