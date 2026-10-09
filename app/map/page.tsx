import type { Metadata } from 'next';
import { MapExplorer } from '@/components/map/map-explorer';

export const metadata: Metadata = {
  title: 'Carte interactive des biens — Wilaya d’Alger',
  description:
    'Explorez les biens disponibles sur une carte OpenStreetMap : groupement des marqueurs, filtres par commune et par type, itinéraire et contact WhatsApp.',
  alternates: { canonical: '/map' },
};

export default function MapPage() {
  return <MapExplorer />;
}
