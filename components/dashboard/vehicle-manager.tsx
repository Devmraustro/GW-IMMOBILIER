'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FuelType, Transmission, Vehicle, VehicleCategory } from '@/types';
import { useI18n } from '@/lib/i18n';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { formatCurrency } from '@/lib/format';
import { validatePositiveNumber } from '@/lib/validation';
import { slugify, uniqueSlug } from '@/lib/slug';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea, FieldError } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SmartImage from '@/components/shared/smart-image';
import { Chip } from '@/components/properties/property-filters';

const CATEGORIES: VehicleCategory[] = ['economique', 'berline', 'suv', 'luxe', 'utilitaire'];
const FEATURES = [
  'climatisation',
  'gps',
  'bluetooth',
  'cuir',
  'toit-ouvrant',
  'camera-recul',
  'radar',
  'siege-bebe',
  'android-auto',
  'apple-carplay',
  'assistance',
] as const;

type Draft = {
  id?: string;
  brand: string;
  model: string;
  year: string;
  category: VehicleCategory;
  transmission: Transmission;
  fuel: FuelType;
  seats: string;
  dailyPrice: string;
  images: string;
  features: string[];
  available: boolean;
  pickupArea: string;
  pickupAddressFr: string;
  pickupAddressAr: string;
  lat: string;
  lng: string;
  descriptionFr: string;
  descriptionAr: string;
};

const EMPTY: Draft = {
  brand: '',
  model: '',
  year: String(new Date().getFullYear() - 1),
  category: 'berline',
  transmission: 'automatique',
  fuel: 'essence',
  seats: '5',
  dailyPrice: '',
  images: '',
  features: ['climatisation'],
  available: true,
  pickupArea: AREAS[0].id,
  pickupAddressFr: '',
  pickupAddressAr: '',
  lat: String(AREAS[0].center.lat),
  lng: String(AREAS[0].center.lng),
  descriptionFr: '',
  descriptionAr: '',
};

function draftFrom(vehicle: Vehicle): Draft {
  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    category: vehicle.category,
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    seats: String(vehicle.seats),
    dailyPrice: String(vehicle.dailyPrice),
    images: vehicle.images.join('\n'),
    features: vehicle.features,
    available: vehicle.available,
    pickupArea: vehicle.pickup.area,
    pickupAddressFr: vehicle.pickup.address.fr,
    pickupAddressAr: vehicle.pickup.address.ar,
    lat: String(vehicle.pickup.coordinates.lat),
    lng: String(vehicle.pickup.coordinates.lng),
    descriptionFr: vehicle.description.fr,
    descriptionAr: vehicle.description.ar,
  };
}

export function VehicleManager() {
  const { t, pick } = useI18n();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, toggleVehicleAvailability } =
    useDemoStore();

  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        if (!query.trim()) return true;
        const haystack =
          `${vehicle.brand} ${vehicle.model} ${vehicle.reference} ${vehicle.category}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [vehicles, query],
  );

  const openCreate = () => {
    setDraft(EMPTY);
    setEditing(false);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setDraft(draftFrom(vehicle));
    setEditing(true);
    setErrors({});
    setOpen(true);
  };

  const save = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.brand.trim()) nextErrors.brand = t.admin.requiredField;
    if (!draft.model.trim()) nextErrors.model = t.admin.requiredField;
    if (!validatePositiveNumber(draft.dailyPrice)) nextErrors.dailyPrice = t.admin.invalidNumber;
    if (!validatePositiveNumber(draft.year)) nextErrors.year = t.admin.invalidNumber;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t.contact.errorTitle);
      return;
    }

    const images = draft.images
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const area = AREAS.find((item) => item.id === draft.pickupArea)!;

    const payload = {
      slug: '',
      reference: '',
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      year: Number(draft.year),
      category: draft.category,
      transmission: draft.transmission,
      fuel: draft.fuel,
      seats: Number(draft.seats) || 5,
      dailyPrice: Number(draft.dailyPrice),
      currency: 'DZD' as const,
      images: images.length ? images : ['/images/fallback/vehicle-1.svg'],
      features: draft.features,
      available: draft.available,
      pickup: {
        area: draft.pickupArea as Vehicle['pickup']['area'],
        address: {
          fr: draft.pickupAddressFr.trim() || pick(area.name),
          ar: draft.pickupAddressAr.trim() || pick(area.name),
        },
        coordinates: {
          lat: Number(draft.lat) || area.center.lat,
          lng: Number(draft.lng) || area.center.lng,
        },
      },
      conditions: [],
      description: {
        fr: draft.descriptionFr.trim(),
        ar: draft.descriptionAr.trim() || draft.descriptionFr.trim(),
      },
      featured: false,
      isDemo: true,
    };

    if (editing && draft.id) {
      const current = vehicles.find((item) => item.id === draft.id);
      updateVehicle(draft.id, {
        ...payload,
        slug: current?.slug ?? slugify(`${payload.brand} ${payload.model}`),
        reference: current?.reference ?? `GWV-${(vehicles.length + 1).toString().padStart(3, '0')}`,
      });
      toast.success(t.admin.saved);
    } else {
      addVehicle({
        ...payload,
        slug: uniqueSlug(`${payload.brand} ${payload.model}`, vehicles.map((v) => v.slug)),
        reference: `GWV-N-${(vehicles.length + 1).toString().padStart(3, '0')}`,
      });
      toast.success(t.admin.created);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t.admin.vehicles}</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {filtered.length} / {vehicles.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.common.search}
              className="w-56 ps-9"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden />
            {t.admin.addVehicle}
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead className="border-b border-ink-100 bg-sand-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldBrand}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.cars.category}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.cars.dailyPrice}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldPickupArea}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.availabilityToggle}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((vehicle) => (
                <tr key={vehicle.id} className="transition-colors hover:bg-sand-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        <SmartImage
                          src={vehicle.images[0] ?? ''}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          seed={vehicle.year}
                          fallbackKind="vehicle"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="font-mono text-[11px] text-ink-400">
                          {vehicle.reference} · {vehicle.year}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{vehicle.category}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">
                    {formatCurrency(vehicle.dailyPrice)}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {pick(AREAS.find((a) => a.id === vehicle.pickup.area)?.name ?? { fr: '', ar: '' })}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={vehicle.available}
                      onCheckedChange={(checked) => {
                        toggleVehicleAvailability(vehicle.id, checked);
                        toast.success(t.admin.availabilityUpdated);
                      }}
                      aria-label={t.admin.fieldAvailable}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="iconSm" title={t.common.viewDetails}>
                        <Link href={`/cars/${vehicle.slug}`}>
                          <Eye aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => openEdit(vehicle)}
                        title={t.common.edit}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        className="text-danger hover:bg-danger-soft"
                        onClick={() => setDeleteId(vehicle.id)}
                        title={t.common.delete}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-ink-400">{t.admin.noResults}</p>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.admin.editVehicle : t.admin.addVehicle}</DialogTitle>
            <DialogDescription>{t.admin.demoBanner}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="vm-brand">
                  {t.admin.fieldBrand} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="vm-brand"
                  value={draft.brand}
                  onChange={(event) => set('brand', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.brand}</FieldError>
              </div>
              <div>
                <Label htmlFor="vm-model">
                  {t.admin.fieldModel} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="vm-model"
                  value={draft.model}
                  onChange={(event) => set('model', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.model}</FieldError>
              </div>
              <div>
                <Label htmlFor="vm-year">{t.admin.fieldYear}</Label>
                <Input
                  id="vm-year"
                  type="number"
                  value={draft.year}
                  onChange={(event) => set('year', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.year}</FieldError>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label htmlFor="vm-category">{t.cars.category}</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => set('category', v as VehicleCategory)}
                >
                  <SelectTrigger id="vm-category" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t.cars[
                          `category${category.charAt(0).toUpperCase()}${category.slice(1)}` as
                            | 'categoryEconomique'
                            | 'categoryBerline'
                            | 'categorySuv'
                            | 'categoryLuxe'
                            | 'categoryUtilitaire'
                        ]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vm-transmission">{t.admin.fieldTransmission}</Label>
                <Select
                  value={draft.transmission}
                  onValueChange={(v) => set('transmission', v as Transmission)}
                >
                  <SelectTrigger id="vm-transmission" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manuelle">{t.cars.transmissionManuelle}</SelectItem>
                    <SelectItem value="automatique">{t.cars.transmissionAutomatique}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vm-fuel">{t.admin.fieldFuel}</Label>
                <Select value={draft.fuel} onValueChange={(v) => set('fuel', v as FuelType)}>
                  <SelectTrigger id="vm-fuel" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essence">{t.cars.fuelEssence}</SelectItem>
                    <SelectItem value="diesel">{t.cars.fuelDiesel}</SelectItem>
                    <SelectItem value="hybride">{t.cars.fuelHybride}</SelectItem>
                    <SelectItem value="electrique">{t.cars.fuelElectrique}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vm-seats">{t.admin.fieldSeats}</Label>
                <Input
                  id="vm-seats"
                  type="number"
                  value={draft.seats}
                  onChange={(event) => set('seats', event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vm-price">
                  {t.admin.fieldDailyPrice} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="vm-price"
                  type="number"
                  value={draft.dailyPrice}
                  onChange={(event) => set('dailyPrice', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.dailyPrice}</FieldError>
              </div>
              <div>
                <Label htmlFor="vm-pickup-area">{t.admin.fieldPickupArea}</Label>
                <Select value={draft.pickupArea} onValueChange={(v) => set('pickupArea', v)}>
                  <SelectTrigger id="vm-pickup-area" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {pick(area.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vm-pickup-fr">{t.admin.fieldPickupAddress}</Label>
                <Input
                  id="vm-pickup-fr"
                  value={draft.pickupAddressFr}
                  onChange={(event) => set('pickupAddressFr', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="vm-pickup-ar">{t.common.optional}</Label>
                <Input
                  id="vm-pickup-ar"
                  value={draft.pickupAddressAr}
                  onChange={(event) => set('pickupAddressAr', event.target.value)}
                  className="mt-1.5"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vm-lat">{t.admin.fieldLatitude}</Label>
                <Input
                  id="vm-lat"
                  value={draft.lat}
                  onChange={(event) => set('lat', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="vm-lng">{t.admin.fieldLongitude}</Label>
                <Input
                  id="vm-lng"
                  value={draft.lng}
                  onChange={(event) => set('lng', event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.admin.fieldFeatures}</Label>
              <div className="flex flex-wrap gap-1.5">
                {FEATURES.map((feature) => (
                  <Chip
                    key={feature}
                    active={draft.features.includes(feature)}
                    onClick={() =>
                      set(
                        'features',
                        draft.features.includes(feature)
                          ? draft.features.filter((item) => item !== feature)
                          : [...draft.features, feature],
                      )
                    }
                  >
                    {t.amenities[feature]}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vm-desc-fr">{t.admin.fieldDescription}</Label>
                <Textarea
                  id="vm-desc-fr"
                  value={draft.descriptionFr}
                  onChange={(event) => set('descriptionFr', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="vm-desc-ar">{t.admin.fieldDescriptionAr}</Label>
                <Textarea
                  id="vm-desc-ar"
                  value={draft.descriptionAr}
                  onChange={(event) => set('descriptionAr', event.target.value)}
                  className="mt-1.5"
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vm-images">{t.admin.fieldImages}</Label>
              <Textarea
                id="vm-images"
                value={draft.images}
                onChange={(event) => set('images', event.target.value)}
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="vm-available"
                checked={draft.available}
                onCheckedChange={(checked) => set('available', checked)}
              />
              <Label htmlFor="vm-available" className="cursor-pointer">
                {t.admin.fieldAvailable}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={save}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.confirmDelete}</DialogTitle>
            <DialogDescription>{t.admin.deleteWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteVehicle(deleteId);
                setDeleteId(null);
                toast.success(t.admin.deleted);
              }}
            >
              {t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VehicleManager;
