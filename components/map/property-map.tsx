'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useEffect, useRef, type MutableRefObject } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { GeoPoint, Property } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, OSM_ATTRIBUTION, OSM_TILE_URL } from '@/lib/config';
import { AREA_BOUNDS } from '@/data/areas';
import { cn } from '@/lib/utils';

export interface PropertyMapHandle {
  map: L.Map | null;
}

interface PropertyMapProps {
  items: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  userLocation?: GeoPoint | null;
  center?: GeoPoint;
  zoom?: number;
  className?: string;
  mapRef?: MutableRefObject<L.Map | null>;
  onTilesError?: () => void;
  /** Fired when the user clicks the map (used by the admin coordinate picker). */
  onMapClick?: (point: GeoPoint) => void;
  /** Re-measure the container (used when the side panel opens/closes). */
  resizeKey?: number;
}

function markerIcon(property: Property, active: boolean, label: string): L.DivIcon {
  const unavailable = property.availability.status !== 'available';
  const classes = [
    'gwi-marker__pin',
    active ? 'gwi-marker__pin--active' : '',
    unavailable ? 'gwi-marker__pin--unavailable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    html: `<div class="${classes}">${label}</div>`,
    className: 'gwi-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 30 ? 44 : 50;
  return L.divIcon({
    html: `<div class="gwi-cluster" style="width:${size}px;height:${size}px">${count}</div>`,
    className: 'gwi-marker',
    iconSize: [size, size],
  });
}

/** Imperative bridge so the page can fly to a point or recentre the view. */
function MapBridge({ mapRef }: { mapRef?: MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    if (mapRef) mapRef.current = map;
    return () => {
      if (mapRef) mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

/** Recompute the container size whenever the layout changes. */
function ResizeObserverBridge({ resizeKey }: { resizeKey?: number }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize({ animate: false }), 60);
    return () => window.clearTimeout(id);
  }, [map, resizeKey]);
  return null;
}

function TileHealthBridge({ onTilesError }: { onTilesError?: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!onTilesError) return;
    let fired = 0;
    const onError = () => {
      fired += 1;
      if (fired >= 4) onTilesError();
    };
    map.on('tileerror', onError);
    return () => {
      map.off('tileerror', onError);
    };
  }, [map, onTilesError]);
  return null;
}

function FitBounds({ items }: { items: Property[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || items.length === 0) return;
    done.current = true;
    map.fitBounds(
      L.latLngBounds(
        [AREA_BOUNDS.south, AREA_BOUNDS.west],
        [AREA_BOUNDS.north, AREA_BOUNDS.east],
      ),
      { padding: [32, 32] },
    );
  }, [map, items.length]);
  return null;
}

/** Emits clicks so the dashboard can pick coordinates on the map. */
function ClickBridge({ onMapClick }: { onMapClick?: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function ClusteredMarkers({
  items,
  selectedId,
  onSelect,
}: {
  items: Property[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 52,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: clusterIcon,
    });
    groupRef.current = group;
    map.addLayer(group);
    return () => {
      map.removeLayer(group);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    const markers = items.map((property) => {
      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
        icon: markerIcon(property, property.id === selectedId, property.type),
        keyboard: true,
        title: property.reference,
        alt: property.reference,
      });
      marker.on('click', () => selectRef.current?.(property.id));
      marker.on('keypress', (event) => {
        if ((event as unknown as { originalEvent: KeyboardEvent }).originalEvent?.key === 'Enter') {
          selectRef.current?.(property.id);
        }
      });
      return marker;
    });
    group.addLayers(markers);
  }, [items, selectedId]);

  return null;
}

function UserMarker({ point }: { point: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([point.lat, point.lng], 15, { duration: 0.9 });
  }, [map, point.lat, point.lng]);
  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={L.divIcon({
        html: '<div class="gwi-user-marker"></div>',
        className: 'gwi-marker',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })}
    />
  );
}

export function PropertyMap({
  items,
  selectedId,
  onSelect,
  userLocation,
  center,
  zoom = DEFAULT_MAP_ZOOM,
  className,
  mapRef,
  onTilesError,
  resizeKey,
  onMapClick,
}: PropertyMapProps) {
  return (
    <MapContainer
      center={center ? [center.lat, center.lng] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
      zoom={zoom}
      scrollWheelZoom
      className={cn('h-full w-full', className)}
      // Attribution is required by the OpenStreetMap tile usage policy.
      attributionControl
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
      <MapBridge mapRef={mapRef} />
      <ResizeObserverBridge resizeKey={resizeKey} />
      <TileHealthBridge onTilesError={onTilesError} />
      <FitBounds items={items} />
      {onMapClick ? <ClickBridge onMapClick={onMapClick} /> : null}
      <ClusteredMarkers items={items} selectedId={selectedId} onSelect={onSelect} />
      {userLocation ? <UserMarker point={userLocation} /> : null}
    </MapContainer>
  );
}

export default PropertyMap;
