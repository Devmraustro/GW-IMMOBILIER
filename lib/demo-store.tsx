'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Inquiry, Property, Reservation, Vehicle } from '@/types';
import { STORAGE_KEYS } from '@/lib/config';
import { properties as seedProperties } from '@/data/properties';
import { vehicles as seedVehicles } from '@/data/vehicles';
import { inquiries as seedInquiries } from '@/data/inquiries';
import { reservations as seedReservations } from '@/data/reservations';

/**
 * ---------------------------------------------------------------------------
 * DEMO PERSISTENCE LAYER
 * ---------------------------------------------------------------------------
 * There is no backend in the prototype. Everything lives in the browser's
 * localStorage and is merged over the seed data on mount. Swapping this file
 * for real API calls (see README → "Backend integration") is the only change
 * required to make the app production-ready: the rest of the UI consumes this
 * hook exclusively.
 * ---------------------------------------------------------------------------
 */

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — demo data simply won't persist */
  }
}

export type DemoStore = {
  hydrated: boolean;
  properties: Property[];
  vehicles: Vehicle[];
  inquiries: Inquiry[];
  reservations: Reservation[];
  favorites: string[];

  addProperty: (input: Omit<Property, 'id' | 'createdAt'> & { id?: string }) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  togglePropertyAvailability: (id: string, status: Property['availability']['status']) => void;

  addVehicle: (input: Omit<Vehicle, 'id' | 'createdAt'> & { id?: string }) => Vehicle;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  toggleVehicleAvailability: (id: string, available: boolean) => void;

  addInquiry: (input: Omit<Inquiry, 'id' | 'createdAt'>) => Inquiry;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => void;
  deleteInquiry: (id: string) => void;

  addReservation: (input: Omit<Reservation, 'id' | 'createdAt'>) => Reservation;
  updateReservation: (id: string, patch: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;

  resetDemoData: () => void;
  getProperty: (idOrSlug: string) => Property | undefined;
  getVehicle: (idOrSlug: string) => Vehicle | undefined;
};

const DemoStoreContext = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [inquiries, setInquiries] = useState<Inquiry[]>(seedInquiries);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [favorites, setFavorites] = useState<string[]>([]);
  const firstRender = useRef(true);

  // Load persisted demo edits once, after mount (keeps SSR markup stable).
  useEffect(() => {
    setProperties(read<Property[]>(STORAGE_KEYS.properties, seedProperties));
    setVehicles(read<Vehicle[]>(STORAGE_KEYS.vehicles, seedVehicles));
    setInquiries(read<Inquiry[]>(STORAGE_KEYS.inquiries, seedInquiries));
    setReservations(read<Reservation[]>(STORAGE_KEYS.reservations, seedReservations));
    setFavorites(read<string[]>(STORAGE_KEYS.favorites, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.properties, properties);
  }, [properties, hydrated]);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.vehicles, vehicles);
  }, [vehicles, hydrated]);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.inquiries, inquiries);
  }, [inquiries, hydrated]);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.reservations, reservations);
  }, [reservations, hydrated]);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.favorites, favorites);
  }, [favorites, hydrated]);

  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
  }, []);

  const addProperty: DemoStore['addProperty'] = useCallback((input) => {
    const created: Property = {
      ...input,
      id: input.id ?? `p-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProperty: DemoStore['updateProperty'] = useCallback((id, patch) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deleteProperty: DemoStore['deleteProperty'] = useCallback((id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePropertyAvailability: DemoStore['togglePropertyAvailability'] = useCallback(
    (id, status) => {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, availability: { ...p.availability, status } } : p,
        ),
      );
    },
    [],
  );

  const addVehicle: DemoStore['addVehicle'] = useCallback((input) => {
    const created: Vehicle = {
      ...input,
      id: input.id ?? `v-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setVehicles((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateVehicle: DemoStore['updateVehicle'] = useCallback((id, patch) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const deleteVehicle: DemoStore['deleteVehicle'] = useCallback((id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const toggleVehicleAvailability: DemoStore['toggleVehicleAvailability'] = useCallback(
    (id, available) => {
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, available } : v)));
    },
    [],
  );

  const addInquiry: DemoStore['addInquiry'] = useCallback((input) => {
    const created: Inquiry = {
      ...input,
      id: `i-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateInquiryStatus: DemoStore['updateInquiryStatus'] = useCallback((id, status) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const deleteInquiry: DemoStore['deleteInquiry'] = useCallback((id) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addReservation: DemoStore['addReservation'] = useCallback((input) => {
    const created: Reservation = {
      ...input,
      id: `r-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateReservation: DemoStore['updateReservation'] = useCallback((id, patch) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteReservation: DemoStore['deleteReservation'] = useCallback((id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    let added = false;
    setFavorites((prev) => {
      if (prev.includes(id)) {
        added = false;
        return prev.filter((f) => f !== id);
      }
      added = true;
      return [id, ...prev];
    });
    return added;
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const resetDemoData = useCallback(() => {
    setProperties(seedProperties);
    setVehicles(seedVehicles);
    setInquiries(seedInquiries);
    setReservations(seedReservations);
    setFavorites([]);
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        if (key !== STORAGE_KEYS.locale) window.localStorage.removeItem(key);
      });
    } catch {
      /* ignore */
    }
  }, []);

  const getProperty = useCallback(
    (idOrSlug: string) =>
      properties.find((p) => p.id === idOrSlug || p.slug === idOrSlug),
    [properties],
  );

  const getVehicle = useCallback(
    (idOrSlug: string) => vehicles.find((v) => v.id === idOrSlug || v.slug === idOrSlug),
    [vehicles],
  );

  const value = useMemo<DemoStore>(
    () => ({
      hydrated,
      properties,
      vehicles,
      inquiries,
      reservations,
      favorites,
      addProperty,
      updateProperty,
      deleteProperty,
      togglePropertyAvailability,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      toggleVehicleAvailability,
      addInquiry,
      updateInquiryStatus,
      deleteInquiry,
      addReservation,
      updateReservation,
      deleteReservation,
      isFavorite,
      toggleFavorite,
      resetDemoData,
      getProperty,
      getVehicle,
    }),
    [
      hydrated,
      properties,
      vehicles,
      inquiries,
      reservations,
      favorites,
      addProperty,
      updateProperty,
      deleteProperty,
      togglePropertyAvailability,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      toggleVehicleAvailability,
      addInquiry,
      updateInquiryStatus,
      deleteInquiry,
      addReservation,
      updateReservation,
      deleteReservation,
      isFavorite,
      toggleFavorite,
      resetDemoData,
      getProperty,
      getVehicle,
    ],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore(): DemoStore {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error('useDemoStore must be used inside <DemoStoreProvider>');
  return ctx;
}

/** Seed values exposed for statistics and for "reset" comparisons. */
export const seedCounts = {
  properties: seedProperties.length,
  vehicles: seedVehicles.length,
  inquiries: seedInquiries.length,
  reservations: seedReservations.length,
};
