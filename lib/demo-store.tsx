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
import { usePathname, useRouter } from 'next/navigation';
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

  addProperty: (input: Omit<Property, 'id' | 'createdAt'> & { id?: string }) => Promise<MutationResult>;
  updateProperty: (id: string, patch: Partial<Property>) => Promise<MutationResult>;
  deleteProperty: (id: string) => Promise<MutationResult>;
  togglePropertyAvailability: (id: string, status: Property['availability']['status']) => Promise<MutationResult>;

  addVehicle: (input: Omit<Vehicle, 'id' | 'createdAt'> & { id?: string }) => Promise<MutationResult>;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => Promise<MutationResult>;
  deleteVehicle: (id: string) => Promise<MutationResult>;
  toggleVehicleAvailability: (id: string, available: boolean) => Promise<MutationResult>;

  addInquiry: (input: Omit<Inquiry, 'id' | 'createdAt'>) => Inquiry;
  submitInquiry: (input: Omit<Inquiry, 'id' | 'createdAt'>) => Promise<Inquiry>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<MutationResult>;
  deleteInquiry: (id: string) => Promise<MutationResult>;

  addReservation: (input: Omit<Reservation, 'id' | 'createdAt'>) => Promise<MutationResult>;
  updateReservation: (id: string, patch: Partial<Reservation>) => Promise<MutationResult>;
  deleteReservation: (id: string) => Promise<MutationResult>;

  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;

  resetDemoData: () => void;
  getProperty: (idOrSlug: string) => Property | undefined;
  getVehicle: (idOrSlug: string) => Vehicle | undefined;
};

const DemoStoreContext = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const adminMode = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const publicCatalogMode =
    process.env.NEXT_PUBLIC_CATALOG_MODE === 'database' ||
    (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_CATALOG_MODE !== 'demo');
  const { t } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<StorePersistenceMode>('loading');
  const [properties, setProperties] = useState<Property[]>(() =>
    adminMode || publicCatalogMode ? [] : seedProperties,
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    adminMode || publicCatalogMode ? [] : seedVehicles,
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>(() =>
    adminMode || publicCatalogMode ? [] : seedInquiries,
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    adminMode || publicCatalogMode ? [] : seedReservations,
  );
  const [favorites, setFavorites] = useState<string[]>([]);
  const firstRender = useRef(true);

  // In production, public catalog mode defaults to database and never exposes
  // the demo seeds. Local demo mode is opt-in via NEXT_PUBLIC_CATALOG_MODE=demo.
  useEffect(() => {
    let cancelled = false;

    if (!adminMode && publicCatalogMode) {
      // Route/mode change must clear the old collection before asynchronous loading.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(false);
      setPersistenceMode('loading');
      setProperties([]);
      setVehicles([]);
      setInquiries([]);
      setReservations([]);
      setFavorites(read<string[]>(STORAGE_KEYS.favorites, []));

      async function loadPublicCatalog() {
        try {
          const [propertiesResponse, vehiclesResponse] = await Promise.all([
            fetch('/api/catalog?type=properties&limit=250', { cache: 'no-store' }),
            fetch('/api/catalog?type=vehicles&limit=250', { cache: 'no-store' }),
          ]);
          if (!propertiesResponse.ok || !vehiclesResponse.ok) {
            throw new Error('Public catalog is unavailable');
          }
          const [propertiesBody, vehiclesBody] = await Promise.all([
            propertiesResponse.json() as Promise<{ records?: unknown }>,
            vehiclesResponse.json() as Promise<{ records?: unknown }>,
          ]);
          if (!Array.isArray(propertiesBody.records) || !Array.isArray(vehiclesBody.records)) {
            throw new Error('Invalid public catalog response');
          }
          if (cancelled) return;
          setProperties(propertiesBody.records as Property[]);
          setVehicles(vehiclesBody.records as Vehicle[]);
          setInquiries([]);
          setReservations([]);
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

      void loadPublicCatalog();
      return () => { cancelled = true; };
    }

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
          router.replace('/admin/login');
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
  }, [adminMode, publicCatalogMode, router]);

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
          router.replace('/admin/login');
          return { ok: false };
        }
        if (!response.ok) {
          if (response.status >= 500) failAdminPersistence();
          else toast.error(t.admin.recordSaveRejected);
          return { ok: false };
        }

        if (method === 'DELETE') return { ok: true };
        const result = (await response.json()) as { record?: unknown };
        if (!result.record || typeof result.record !== 'object' || Array.isArray(result.record)) {
          failAdminPersistence();
          return { ok: false };
        }
        return { ok: true, record: result.record as Record<string, unknown> };
      } catch {
        failAdminPersistence();
        return { ok: false };
      }
    },
    [adminMode, persistenceMode, failAdminPersistence, router, t.admin.recordSaveRejected],
  );

  const addProperty: DemoStore['addProperty'] = useCallback(async (input) => {
    const created: Property = {
      ...input,
      id: input.id ?? `p-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      isDemo: adminMode ? false : input.isDemo,
    };

    if (adminMode) {
      const { id: _localId, createdAt: _localCreatedAt, ...record } = created;
      const result = await persistAdminMutation('POST', { type: 'properties', record });
      if (result.ok && result.record) {
        setProperties((prev) => [result.record as unknown as Property, ...prev]);
      }
      return result;
    }

    setProperties((prev) => [created, ...prev]);
    return { ok: true, record: created as unknown as Record<string, unknown> };
  }, [adminMode, persistAdminMutation]);

  const updateProperty: DemoStore['updateProperty'] = useCallback(async (id, patch) => {
    if (adminMode) {
      const result = await persistAdminMutation('PATCH', { type: 'properties', id, patch });
      if (result.ok && result.record) {
        setProperties((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Property) : item,
        ));
      }
      return result;
    }

    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const deleteProperty: DemoStore['deleteProperty'] = useCallback(async (id) => {
    if (adminMode) {
      const result = await persistAdminMutation('DELETE', { type: 'properties', id });
      if (result.ok) setProperties((prev) => prev.filter((p) => p.id !== id));
      return result;
    }

    setProperties((prev) => prev.filter((p) => p.id !== id));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const togglePropertyAvailability: DemoStore['togglePropertyAvailability'] = useCallback(
    async (id, status) => {
      const property = properties.find((item) => item.id === id);
      if (!property) return { ok: false };
      return updateProperty(id, { availability: { ...property.availability, status } });
    },
    [properties, updateProperty],
  );

  const addVehicle: DemoStore['addVehicle'] = useCallback(async (input) => {
    const created: Vehicle = {
      ...input,
      id: input.id ?? `v-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      isDemo: adminMode ? false : input.isDemo,
    };

    if (adminMode) {
      const { id: _localId, createdAt: _localCreatedAt, ...record } = created;
      const result = await persistAdminMutation('POST', { type: 'vehicles', record });
      if (result.ok && result.record) {
        setVehicles((prev) => [result.record as unknown as Vehicle, ...prev]);
      }
      return result;
    }

    setVehicles((prev) => [created, ...prev]);
    return { ok: true, record: created as unknown as Record<string, unknown> };
  }, [adminMode, persistAdminMutation]);

  const updateVehicle: DemoStore['updateVehicle'] = useCallback(async (id, patch) => {
    if (adminMode) {
      const result = await persistAdminMutation('PATCH', { type: 'vehicles', id, patch });
      if (result.ok && result.record) {
        setVehicles((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Vehicle) : item,
        ));
      }
      return result;
    }

    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const deleteVehicle: DemoStore['deleteVehicle'] = useCallback(async (id) => {
    if (adminMode) {
      const result = await persistAdminMutation('DELETE', { type: 'vehicles', id });
      if (result.ok) setVehicles((prev) => prev.filter((v) => v.id !== id));
      return result;
    }

    setVehicles((prev) => prev.filter((v) => v.id !== id));
    return { ok: true };
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
    return created;
  }, []);

  const submitInquiry: DemoStore['submitInquiry'] = useCallback(
    async (input) => {
      if (adminMode) throw new Error('INQUIRY_SUBMISSION_NOT_AVAILABLE_IN_ADMIN');
      if (!publicCatalogMode) return addInquiry(input);

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          type: input.type,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          ...(input.email?.trim() ? { email: input.email.trim() } : {}),
          message: input.message.trim(),
          ...(input.propertyId ? { propertyId: input.propertyId } : {}),
          ...(input.vehicleId ? { vehicleId: input.vehicleId } : {}),
          ...(input.startDate ? { startDate: input.startDate } : {}),
          ...(input.endDate ? { endDate: input.endDate } : {}),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: unknown } | null;
        throw new Error(typeof body?.error === 'string' ? body.error : 'SUBMISSION_UNAVAILABLE');
      }
      const body = await response.json() as { inquiry?: unknown };
      if (!body.inquiry || typeof body.inquiry !== 'object') {
        throw new Error('INVALID_INQUIRY_RESPONSE');
      }
      const saved = body.inquiry as Inquiry;
      setInquiries((prev) => [saved, ...prev]);
      return saved;
    },
    [adminMode, publicCatalogMode, addInquiry],
  );

  const updateInquiryStatus: DemoStore['updateInquiryStatus'] = useCallback(async (id, status) => {
    if (adminMode) {
      const result = await persistAdminMutation('PATCH', { type: 'inquiries', id, patch: { status } });
      if (result.ok && result.record) {
        setInquiries((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Inquiry) : item,
        ));
      }
      return result;
    }

    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const deleteInquiry: DemoStore['deleteInquiry'] = useCallback(async (id) => {
    if (adminMode) {
      const result = await persistAdminMutation('DELETE', { type: 'inquiries', id });
      if (result.ok) setInquiries((prev) => prev.filter((i) => i.id !== id));
      return result;
    }

    setInquiries((prev) => prev.filter((i) => i.id !== id));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const addReservation: DemoStore['addReservation'] = useCallback(async (input) => {
    const created: Reservation = {
      ...input,
      id: `r-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };

    if (adminMode) {
      const { id: _localId, createdAt: _localCreatedAt, ...record } = created;
      const result = await persistAdminMutation('POST', { type: 'reservations', record });
      if (result.ok && result.record) {
        setReservations((prev) => [result.record as unknown as Reservation, ...prev]);
      }
      return result;
    }

    setReservations((prev) => [created, ...prev]);
    return { ok: true, record: created as unknown as Record<string, unknown> };
  }, [adminMode, persistAdminMutation]);

  const updateReservation: DemoStore['updateReservation'] = useCallback(async (id, patch) => {
    if (adminMode) {
      const result = await persistAdminMutation('PATCH', { type: 'reservations', id, patch });
      if (result.ok && result.record) {
        setReservations((prev) => prev.map((item) =>
          item.id === id ? (result.record as unknown as Reservation) : item,
        ));
      }
      return result;
    }

    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return { ok: true };
  }, [adminMode, persistAdminMutation]);

  const deleteReservation: DemoStore['deleteReservation'] = useCallback(async (id) => {
    if (adminMode) {
      const result = await persistAdminMutation('DELETE', { type: 'reservations', id });
      if (result.ok) setReservations((prev) => prev.filter((r) => r.id !== id));
      return result;
    }

    setReservations((prev) => prev.filter((r) => r.id !== id));
    return { ok: true };
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
      submitInquiry,
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
      submitInquiry,
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
