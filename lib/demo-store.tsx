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
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import type { Inquiry, Property, Reservation, Vehicle } from '@/types';
import { STORAGE_KEYS } from '@/lib/config';
import { properties as seedProperties } from '@/data/properties';
import { vehicles as seedVehicles } from '@/data/vehicles';
import { inquiries as seedInquiries } from '@/data/inquiries';
import { reservations as seedReservations } from '@/data/reservations';

/**
 * Store adapter for the existing UI. Public browsing keeps prototype seed
 * data until catalog migration. The admin dashboard only loads authenticated
 * server records and never falls back to browser storage.
 */
export type StorePersistenceMode = 'loading' | 'database' | 'demo' | 'unavailable';
type AdminRecordType = 'properties' | 'vehicles' | 'inquiries' | 'reservations';
type MutationResult = { ok: boolean; record?: Record<string, unknown> };

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
  persistenceMode: StorePersistenceMode;
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
  const pathname = usePathname();
  const adminMode = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const { t } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<StorePersistenceMode>('loading');
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [inquiries, setInquiries] = useState<Inquiry[]>(seedInquiries);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [favorites, setFavorites] = useState<string[]>([]);
  const firstRender = useRef(true);

  // Public pages keep local prototype data. Admin loads only authenticated
  // server records; a failed database request must never display seed data.
  useEffect(() => {
    let cancelled = false;
    if (!adminMode) {
      setProperties(read<Property[]>(STORAGE_KEYS.properties, seedProperties));
      setVehicles(read<Vehicle[]>(STORAGE_KEYS.vehicles, seedVehicles));
      setInquiries(read<Inquiry[]>(STORAGE_KEYS.inquiries, seedInquiries));
      setReservations(read<Reservation[]>(STORAGE_KEYS.reservations, seedReservations));
      setFavorites(read<string[]>(STORAGE_KEYS.favorites, []));
      setPersistenceMode('demo');
      setHydrated(true);
      return () => { cancelled = true; };
    }

    setHydrated(false);
    setPersistenceMode('loading');
    setProperties([]);
    setVehicles([]);
    setInquiries([]);
    setReservations([]);
    setFavorites(read<string[]>(STORAGE_KEYS.favorites, []));

    async function loadAdminRecords() {
      try {
        const types: AdminRecordType[] = ['properties', 'vehicles', 'inquiries', 'reservations'];
        const responses = await Promise.all(
          types.map((type) => fetch(`/api/admin/records?type=${type}&limit=250`, {
            cache: 'no-store',
            credentials: 'same-origin',
          })),
        );
        if (responses.some((response) => response.status === 401)) {
          window.location.assign('/admin/login');
          return;
        }
        if (responses.some((response) => !response.ok)) {
          throw new Error('Unable to load every admin collection');
        }
        const bodies = await Promise.all(
          responses.map((response) => response.json() as Promise<{ records?: unknown }>),
        );
        if (bodies.some((body) => !Array.isArray(body.records))) {
          throw new Error('Invalid admin collection response');
        }
        if (cancelled) return;
        setProperties(bodies[0].records as Property[]);
        setVehicles(bodies[1].records as Vehicle[]);
        setInquiries(bodies[2].records as Inquiry[]);
        setReservations(bodies[3].records as Reservation[]);
        setPersistenceMode('database');
        setHydrated(true);
      } catch {
        if (cancelled) return;
        setProperties([]);
        setVehicles([]);
        setInquiries([]);
        setReservations([]);
        setPersistenceMode('unavailable');
        setHydrated(true);
      }
    }
    void loadAdminRecords();
    return () => { cancelled = true; };
  }, [adminMode]);

  useEffect(() => {
    if (firstRender.current || !hydrated || adminMode || persistenceMode !== 'demo') return;
    write(STORAGE_KEYS.properties, properties);
  }, [properties, hydrated, adminMode, persistenceMode]);

  useEffect(() => {
    if (firstRender.current || !hydrated || adminMode || persistenceMode !== 'demo') return;
    write(STORAGE_KEYS.vehicles, vehicles);
  }, [vehicles, hydrated, adminMode, persistenceMode]);

  useEffect(() => {
    if (firstRender.current || !hydrated || adminMode || persistenceMode !== 'demo') return;
    write(STORAGE_KEYS.inquiries, inquiries);
  }, [inquiries, hydrated, adminMode, persistenceMode]);

  useEffect(() => {
    if (firstRender.current || !hydrated || adminMode || persistenceMode !== 'demo') return;
    write(STORAGE_KEYS.reservations, reservations);
  }, [reservations, hydrated, adminMode, persistenceMode]);

  useEffect(() => {
    if (firstRender.current || !hydrated) return;
    write(STORAGE_KEYS.favorites, favorites);
  }, [favorites, hydrated]);

  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
  }, []);

  const failAdminPersistence = useCallback(() => {
    setProperties([]);
    setVehicles([]);
    setInquiries([]);
    setReservations([]);
    setPersistenceMode('unavailable');
    setHydrated(true);
    toast.error(t.admin.databaseSaveFailed);
  }, [t.admin.databaseSaveFailed]);

  const persistAdminMutation = useCallback(
    async (
      method: 'POST' | 'PATCH' | 'DELETE',
      body: Record<string, unknown>,
    ): Promise<MutationResult> => {
      if (!adminMode) return { ok: true };
      if (persistenceMode !== 'database') {
        failAdminPersistence();
        return { ok: false };
      }
      try {
        const response = await fetch('/api/admin/records', {
          method,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify(body),
        });
        if (response.status === 401) {
          window.location.assign('/admin/login');
          return { ok: false };
        }
        if (!response.ok) throw new Error('Admin record request failed');
        const result = (await response.json()) as { record?: Record<string, unknown> };
        return { ok: true, record: result.record };
      } catch {
        failAdminPersistence();
        return { ok: false };
      }
    },
    [adminMode, persistenceMode, failAdminPersistence],
  );

  const addProperty: DemoStore['addProperty'] = useCallback((input) => {
    const created: Property = {
      ...input,
      id: input.id ?? `p-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      isDemo: adminMode ? false : input.isDemo,
    };
    setProperties((prev) => [created, ...prev]);
    if (adminMode) {
      void persistAdminMutation('POST', { type: 'properties', record: created }).then((result) => {
        if (result.ok && result.record) setProperties((prev) => prev.map((item) =>
          item.id === created.id ? (result.record as unknown as Property) : item,
        ));
      });
    }
    return created;
  }, [adminMode, persistAdminMutation]);

  const updateProperty: DemoStore['updateProperty'] = useCallback((id, patch) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (adminMode) {
      void persistAdminMutation('PATCH', { type: 'properties', id, patch }).then((result) => {
        if (result.ok && result.record) setProperties((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Property) : item,
        ));
      });
    }
  }, [adminMode, persistAdminMutation]);

  const deleteProperty: DemoStore['deleteProperty'] = useCallback((id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    if (adminMode) void persistAdminMutation('DELETE', { type: 'properties', id });
  }, [adminMode, persistAdminMutation]);

  const togglePropertyAvailability: DemoStore['togglePropertyAvailability'] = useCallback(
    (id, status) => {
      const property = properties.find((item) => item.id === id);
      if (!property) return;
      updateProperty(id, { availability: { ...property.availability, status } });
    },
    [properties, updateProperty],
  );

  const addVehicle: DemoStore['addVehicle'] = useCallback((input) => {
    const created: Vehicle = {
      ...input,
      id: input.id ?? `v-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      isDemo: adminMode ? false : input.isDemo,
    };
    setVehicles((prev) => [created, ...prev]);
    if (adminMode) {
      void persistAdminMutation('POST', { type: 'vehicles', record: created }).then((result) => {
        if (result.ok && result.record) setVehicles((prev) => prev.map((item) =>
          item.id === created.id ? (result.record as unknown as Vehicle) : item,
        ));
      });
    }
    return created;
  }, [adminMode, persistAdminMutation]);

  const updateVehicle: DemoStore['updateVehicle'] = useCallback((id, patch) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    if (adminMode) {
      void persistAdminMutation('PATCH', { type: 'vehicles', id, patch }).then((result) => {
        if (result.ok && result.record) setVehicles((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Vehicle) : item,
        ));
      });
    }
  }, [adminMode, persistAdminMutation]);

  const deleteVehicle: DemoStore['deleteVehicle'] = useCallback((id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (adminMode) void persistAdminMutation('DELETE', { type: 'vehicles', id });
  }, [adminMode, persistAdminMutation]);

  const toggleVehicleAvailability: DemoStore['toggleVehicleAvailability'] = useCallback(
    (id, available) => updateVehicle(id, { available }),
    [updateVehicle],
  );

  const addInquiry: DemoStore['addInquiry'] = useCallback((input) => {
    const created: Inquiry = {
      ...input,
      id: `i-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [created, ...prev]);
    if (adminMode) {
      void persistAdminMutation('POST', { type: 'inquiries', record: created }).then((result) => {
        if (result.ok && result.record) setInquiries((prev) => prev.map((item) =>
          item.id === created.id ? (result.record as unknown as Inquiry) : item,
        ));
      });
    }
    return created;
  }, [adminMode, persistAdminMutation]);

  const updateInquiryStatus: DemoStore['updateInquiryStatus'] = useCallback((id, status) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    if (adminMode) {
      void persistAdminMutation('PATCH', { type: 'inquiries', id, patch: { status } }).then((result) => {
        if (result.ok && result.record) setInquiries((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Inquiry) : item,
        ));
      });
    }
  }, [adminMode, persistAdminMutation]);

  const deleteInquiry: DemoStore['deleteInquiry'] = useCallback((id) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    if (adminMode) void persistAdminMutation('DELETE', { type: 'inquiries', id });
  }, [adminMode, persistAdminMutation]);

  const addReservation: DemoStore['addReservation'] = useCallback((input) => {
    const created: Reservation = {
      ...input,
      id: `r-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [created, ...prev]);
    if (adminMode) {
      void persistAdminMutation('POST', { type: 'reservations', record: created }).then((result) => {
        if (result.ok && result.record) setReservations((prev) => prev.map((item) =>
          item.id === created.id ? (result.record as unknown as Reservation) : item,
        ));
      });
    }
    return created;
  }, [adminMode, persistAdminMutation]);

  const updateReservation: DemoStore['updateReservation'] = useCallback((id, patch) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (adminMode) {
      void persistAdminMutation('PATCH', { type: 'reservations', id, patch }).then((result) => {
        if (result.ok && result.record) setReservations((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Reservation) : item,
        ));
      });
    }
  }, [adminMode, persistAdminMutation]);

  const deleteReservation: DemoStore['deleteReservation'] = useCallback((id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    if (adminMode) void persistAdminMutation('DELETE', { type: 'reservations', id });
  }, [adminMode, persistAdminMutation]);

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
    if (adminMode) return;
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
  }, [adminMode]);

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
      persistenceMode,
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
      persistenceMode,
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
