'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AvailabilityStatus,
  CoordinatePrecision,
  ListingCategory,
  Property,
  PropertyType,
  RentalPeriod,
} from '@/types';
import { useI18n } from '@/lib/i18n';
import { propertyTypeLabel, priceUnitLabel } from '@/lib/labels';
import { useDemoStore } from '@/lib/demo-store';
import { AREAS } from '@/data/areas';
import { PROPERTY_TYPES, RENTAL_PERIODS } from '@/lib/filters';
import { formatCurrency, formatSurface } from '@/lib/format';
import { validateCoordinates, validatePositiveNumber } from '@/lib/validation';
import { slugify, uniqueSlug, createId } from '@/lib/slug';
import { cn } from '@/lib/utils';
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
import { PropertyMapLazy } from '@/components/map/map-lazy';
import { Chip } from '@/components/properties/property-filters';

const AMENITY_KEYS = [
  'wifi',
  'internet-fibre',
  'climatisation',
  'chauffage',
  'ascenseur',
  'balcon',
  'terrace',
  'jardin',
  'piscine',
  'securite',
  'concierge',
  'cuisine-equipee',
  'machine-a-laver',
  'tv',
  'garde-meuble',
  'garage',
  'parking',
  'vue-mer',
  'proche-transport',
  'groupe-electrogene',
] as const;

const CATEGORIES: ListingCategory[] = ['rent', 'sale', 'exchange'];
const STATUSES: AvailabilityStatus[] = ['available', 'reserved', 'unavailable'];
const PRECISIONS: CoordinatePrecision[] = ['exact', 'approximate', 'area'];

type Draft = {
  id?: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: PropertyType;
  category: ListingCategory;
  rentalPeriod: RentalPeriod | '';
  price: string;
  priceUnit: 'day' | 'month' | 'year' | 'total';
  area: string;
  addressFr: string;
  addressAr: string;
  lat: string;
  lng: string;
  precision: CoordinatePrecision;
  surface: string;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  furnished: boolean;
  featured: boolean;
  amenities: string[];
  images: string;
  status: AvailabilityStatus;
  availableFrom: string;
};

const EMPTY_DRAFT: Draft = {
  titleFr: '',
  titleAr: '',
  descriptionFr: '',
  descriptionAr: '',
  type: 'F3',
  category: 'rent',
  rentalPeriod: 'monthly',
  price: '',
  priceUnit: 'month',
  area: AREAS[0].id,
  addressFr: '',
  addressAr: '',
  lat: '',
  lng: '',
  precision: 'approximate',
  surface: '',
  bedrooms: '2',
  bathrooms: '1',
  floor: '0',
  furnished: false,
  featured: false,
  amenities: [],
  images: '',
  status: 'available',
  availableFrom: '',
};

function draftFrom(property: Property): Draft {
  return {
    id: property.id,
    titleFr: property.title.fr,
    titleAr: property.title.ar,
    descriptionFr: property.description.fr,
    descriptionAr: property.description.ar,
    type: property.type,
    category: property.category,
    rentalPeriod: property.rentalPeriod ?? '',
    price: String(property.price),
    priceUnit: property.priceUnit,
    area: property.area,
    addressFr: property.address.fr,
    addressAr: property.address.ar,
    lat: String(property.coordinates.lat),
    lng: String(property.coordinates.lng),
    precision: property.coordinatePrecision,
    surface: String(property.surface),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    floor: String(property.floor ?? 0),
    furnished: property.furnished,
    featured: property.featured,
    amenities: property.amenities,
    images: property.images.join('\n'),
    status: property.availability.status,
    availableFrom: property.availability.availableFrom,
  };
}

export function PropertyManager() {
  const { t, pick } = useI18n();
  const { properties, addProperty, updateProperty, deleteProperty, togglePropertyAvailability } =
    useDemoStore();

  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const filtered = useMemo(
    () =>
      properties.filter((item) => {
        if (!query.trim()) return true;
        const haystack =
          `${item.reference} ${item.title.fr} ${item.title.ar} ${item.area} ${item.type}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [properties, query],
  );

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setDraft({ ...EMPTY_DRAFT, lat: String(AREAS[0].center.lat), lng: String(AREAS[0].center.lng) });
    setEditing(false);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (property: Property) => {
    setDraft(draftFrom(property));
    setEditing(true);
    setErrors({});
    setFormOpen(true);
  };

  const save = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.titleFr.trim()) nextErrors.titleFr = t.admin.requiredField;
    if (!draft.descriptionFr.trim()) nextErrors.descriptionFr = t.admin.requiredField;
    if (!validatePositiveNumber(draft.price)) nextErrors.price = t.admin.invalidNumber;
    if (!validatePositiveNumber(draft.surface)) nextErrors.surface = t.admin.invalidNumber;
    if (!validateCoordinates(draft.lat, draft.lng))
      nextErrors.lat = t.admin.invalidCoordinates;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t.contact.errorTitle);
      return;
    }

    const images = draft.images
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      slug: '',
      reference: '',
      title: { fr: draft.titleFr.trim(), ar: draft.titleAr.trim() || draft.titleFr.trim() },
      description: {
        fr: draft.descriptionFr.trim(),
        ar: draft.descriptionAr.trim() || draft.descriptionFr.trim(),
      },
      type: draft.type,
      category: draft.category,
      rentalPeriod: draft.category === 'rent' ? (draft.rentalPeriod || undefined) : undefined,
      price: Number(draft.price),
      priceUnit: draft.category === 'sale' ? ('total' as const) : draft.priceUnit,
      currency: 'DZD' as const,
      area: draft.area as Property['area'],
      address: {
        fr: draft.addressFr.trim() || pick(AREAS.find((a) => a.id === draft.area)!.name),
        ar: draft.addressAr.trim() || pick(AREAS.find((a) => a.id === draft.area)!.name),
      },
      coordinates: { lat: Number(draft.lat), lng: Number(draft.lng) },
      coordinatePrecision: draft.precision,
      surface: Number(draft.surface),
      bedrooms: Number(draft.bedrooms) || 0,
      bathrooms: Number(draft.bathrooms) || 0,
      floor: Number(draft.floor) || 0,
      furnished: draft.furnished,
      amenities: draft.amenities,
      images: images.length
        ? images
        : ['/images/fallback/property-1.svg'],
      availability: {
        status: draft.status,
        availableFrom: draft.availableFrom || new Date().toISOString().slice(0, 10),
      },
      conditions: [],
      featured: draft.featured,
      isDemo: true,
    };

    if (editing && draft.id) {
      const current = properties.find((item) => item.id === draft.id);
      updateProperty(draft.id, {
        ...payload,
        slug: current?.slug ?? slugify(payload.title.fr),
        reference: current?.reference ?? `GWI-${createId('X').slice(-4).toUpperCase()}`,
      });
      toast.success(t.admin.saved);
    } else {
      const taken = properties.map((item) => item.slug);
      addProperty({
        ...payload,
        slug: uniqueSlug(payload.title.fr, taken),
        reference: `GWI-N-${(properties.length + 1).toString().padStart(4, '0')}`,
      });
      toast.success(t.admin.created);
    }

    setFormOpen(false);
  };

  // Temporary listing used only to preview the marker on the picker map.
  const previewProperty: Property = {
    id: 'draft',
    slug: 'draft',
    reference: 'DRAFT',
    title: { fr: draft.titleFr || 'Nouveau bien', ar: draft.titleAr || 'Nouveau bien' },
    description: { fr: '', ar: '' },
    type: draft.type,
    category: draft.category,
    price: Number(draft.price) || 0,
    priceUnit: draft.priceUnit,
    currency: 'DZD',
    area: draft.area as Property['area'],
    address: { fr: '', ar: '' },
    coordinates: {
      lat: Number(draft.lat) || AREAS[0].center.lat,
      lng: Number(draft.lng) || AREAS[0].center.lng,
    },
    coordinatePrecision: draft.precision,
    surface: Number(draft.surface) || 0,
    bedrooms: 0,
    bathrooms: 0,
    furnished: draft.furnished,
    amenities: [],
    images: [],
    availability: { status: draft.status, availableFrom: draft.availableFrom || '' },
    conditions: [],
    featured: false,
    isDemo: true,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t.admin.properties}</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            {filtered.length} / {properties.length}
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
            {t.admin.addProperty}
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-ink-100 bg-sand-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldTitle}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.common.area}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.common.type}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.common.price}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.fieldStatus}</th>
                <th className="px-4 py-3 text-start font-semibold">{t.admin.availabilityToggle}</th>
                <th className="px-4 py-3 text-end font-semibold">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((property) => (
                <tr key={property.id} className="transition-colors hover:bg-sand-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                        <SmartImage
                          src={property.images[0] ?? ''}
                          alt={pick(property.title)}
                          fill
                          seed={property.surface}
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{pick(property.title)}</p>
                        <p className="font-mono text-[11px] text-ink-400">{property.reference}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {pick(AREAS.find((a) => a.id === property.area)?.name ?? { fr: '', ar: '' })}
                    <p className="text-[11px] text-ink-400">{formatSurface(property.surface)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{propertyTypeLabel(property.type, t)}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums">
                    {formatCurrency(property.price)}
                    <p className="text-[11px] font-normal text-ink-400">{priceUnitLabel(property.priceUnit, t)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={property.availability.status}
                      onValueChange={(value) => {
                        togglePropertyAvailability(property.id, value as AvailabilityStatus);
                        toast.success(t.admin.availabilityUpdated);
                      }}
                    >
                      <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {t.properties.availabilityStatus[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={property.availability.status === 'available'}
                      onCheckedChange={(checked) => {
                        togglePropertyAvailability(
                          property.id,
                          checked ? 'available' : 'unavailable',
                        );
                        toast.success(t.admin.availabilityUpdated);
                      }}
                      aria-label={t.admin.availabilityToggle}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="iconSm" title={t.common.viewDetails}>
                        <Link href={`/properties/${property.slug}`}>
                          <Eye aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => openEdit(property)}
                        title={t.common.edit}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => setDeleteId(property.id)}
                        className="text-danger hover:bg-danger-soft"
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

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? t.admin.editProperty : t.admin.addProperty}</DialogTitle>
            <DialogDescription>{t.admin.demoBanner}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-title-fr">
                  {t.admin.fieldTitle} (FR) <span className="text-danger">*</span>
                </Label>
                <Input
                  id="pm-title-fr"
                  value={draft.titleFr}
                  onChange={(event) => set('titleFr', event.target.value)}
                  className="mt-1.5"
                  aria-invalid={Boolean(errors.titleFr)}
                />
                <FieldError>{errors.titleFr}</FieldError>
              </div>
              <div>
                <Label htmlFor="pm-title-ar">{t.admin.fieldTitleAr}</Label>
                <Input
                  id="pm-title-ar"
                  value={draft.titleAr}
                  onChange={(event) => set('titleAr', event.target.value)}
                  className="mt-1.5"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-desc-fr">
                  {t.admin.fieldDescription} (FR) <span className="text-danger">*</span>
                </Label>
                <Textarea
                  id="pm-desc-fr"
                  value={draft.descriptionFr}
                  onChange={(event) => set('descriptionFr', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.descriptionFr}</FieldError>
              </div>
              <div>
                <Label htmlFor="pm-desc-ar">{t.admin.fieldDescriptionAr}</Label>
                <Textarea
                  id="pm-desc-ar"
                  value={draft.descriptionAr}
                  onChange={(event) => set('descriptionAr', event.target.value)}
                  className="mt-1.5"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pm-type">{t.admin.fieldType}</Label>
                <Select value={draft.type} onValueChange={(v) => set('type', v as PropertyType)}>
                  <SelectTrigger id="pm-type" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {propertyTypeLabel(type, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pm-category">{t.admin.fieldCategory}</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => set('category', v as ListingCategory)}
                >
                  <SelectTrigger id="pm-category" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t.categories[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pm-period">{t.admin.fieldPeriod}</Label>
                <Select
                  value={draft.rentalPeriod || 'none'}
                  onValueChange={(v) => set('rentalPeriod', v === 'none' ? '' : (v as RentalPeriod))}
                >
                  <SelectTrigger id="pm-period" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.common.all}</SelectItem>
                    {RENTAL_PERIODS.map((period) => (
                      <SelectItem key={period} value={period}>
                        {t.periods[period]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label htmlFor="pm-price">
                  {t.admin.fieldPrice} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="pm-price"
                  type="number"
                  value={draft.price}
                  onChange={(event) => set('price', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.price}</FieldError>
              </div>
              <div>
                <Label htmlFor="pm-unit">{t.admin.fieldPriceUnit}</Label>
                <Select
                  value={draft.priceUnit}
                  onValueChange={(v) => set('priceUnit', v as Draft['priceUnit'])}
                >
                  <SelectTrigger id="pm-unit" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t.common.perDay}</SelectItem>
                    <SelectItem value="month">{t.common.perMonth}</SelectItem>
                    <SelectItem value="year">{t.common.perYear}</SelectItem>
                    <SelectItem value="total">{t.common.total}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pm-surface">
                  {t.admin.fieldSurface} <span className="text-danger">*</span>
                </Label>
                <Input
                  id="pm-surface"
                  type="number"
                  value={draft.surface}
                  onChange={(event) => set('surface', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.surface}</FieldError>
              </div>
              <div>
                <Label htmlFor="pm-floor">{t.admin.fieldFloor}</Label>
                <Input
                  id="pm-floor"
                  type="number"
                  value={draft.floor}
                  onChange={(event) => set('floor', event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="pm-bedrooms">{t.admin.fieldBedrooms}</Label>
                <Input
                  id="pm-bedrooms"
                  type="number"
                  value={draft.bedrooms}
                  onChange={(event) => set('bedrooms', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pm-bathrooms">{t.admin.fieldBathrooms}</Label>
                <Input
                  id="pm-bathrooms"
                  type="number"
                  value={draft.bathrooms}
                  onChange={(event) => set('bathrooms', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pm-area">{t.admin.fieldArea}</Label>
                <Select value={draft.area} onValueChange={(v) => set('area', v)}>
                  <SelectTrigger id="pm-area" className="mt-1.5">
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
                <Label htmlFor="pm-address-fr">{t.admin.fieldAddress}</Label>
                <Input
                  id="pm-address-fr"
                  value={draft.addressFr}
                  onChange={(event) => set('addressFr', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pm-address-ar">{t.admin.fieldAddressAr}</Label>
                <Input
                  id="pm-address-ar"
                  value={draft.addressAr}
                  onChange={(event) => set('addressAr', event.target.value)}
                  className="mt-1.5"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <div>
                <Label htmlFor="pm-lat">{t.admin.fieldLatitude}</Label>
                <Input
                  id="pm-lat"
                  value={draft.lat}
                  onChange={(event) => set('lat', event.target.value)}
                  className="mt-1.5"
                />
                <FieldError>{errors.lat}</FieldError>
              </div>
              <div>
                <Label htmlFor="pm-lng">{t.admin.fieldLongitude}</Label>
                <Input
                  id="pm-lng"
                  value={draft.lng}
                  onChange={(event) => set('lng', event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pm-precision">{t.admin.fieldPrecision}</Label>
                <Select
                  value={draft.precision}
                  onValueChange={(v) => set('precision', v as CoordinatePrecision)}
                >
                  <SelectTrigger id="pm-precision" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRECISIONS.map((precision) => (
                      <SelectItem key={precision} value={precision}>
                        {t.properties.precision[precision]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => setMapOpen(true)} className="mt-1.5">
                  <MapPin aria-hidden />
                  {t.admin.selectFromMap}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.admin.fieldAmenities}</Label>
              <div className="flex flex-wrap gap-1.5">
                {AMENITY_KEYS.map((key) => (
                  <Chip
                    key={key}
                    active={draft.amenities.includes(key)}
                    onClick={() =>
                      set('amenities', draft.amenities.includes(key)
                        ? draft.amenities.filter((item) => item !== key)
                        : [...draft.amenities, key])
                    }
                  >
                    {t.amenities[key]}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="pm-images">{t.admin.fieldImages}</Label>
              <Textarea
                id="pm-images"
                value={draft.images}
                onChange={(event) => set('images', event.target.value)}
                placeholder="https://images.unsplash.com/…"
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pm-status">{t.admin.fieldStatus}</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => set('status', v as AvailabilityStatus)}
                >
                  <SelectTrigger id="pm-status" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t.properties.availabilityStatus[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pm-available-from">{t.admin.fieldAvailableFrom}</Label>
                <Input
                  id="pm-available-from"
                  type="date"
                  value={draft.availableFrom}
                  onChange={(event) => set('availableFrom', event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="pm-furnished"
                  checked={draft.furnished}
                  onCheckedChange={(checked) => set('furnished', checked)}
                />
                <Label htmlFor="pm-furnished" className="cursor-pointer">
                  {t.admin.fieldFurnished}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="pm-featured"
                  checked={draft.featured}
                  onCheckedChange={(checked) => set('featured', checked)}
                />
                <Label htmlFor="pm-featured" className="cursor-pointer">
                  {t.admin.fieldFeatured}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={save}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coordinate picker */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.admin.selectFromMap}</DialogTitle>
            <DialogDescription>{t.admin.pickCoordinatesHint}</DialogDescription>
          </DialogHeader>
          <div className={cn('h-[380px] w-full overflow-hidden rounded-xl border border-ink-100')}>
            <PropertyMapLazy
              items={[previewProperty]}
              center={previewProperty.coordinates}
              zoom={13}
              onMapClick={(point) => {
                set('lat', point.lat.toFixed(6));
                set('lng', point.lng.toFixed(6));
                set('precision', 'exact');
                toast.success(
                  `${t.admin.fieldLatitude} ${point.lat.toFixed(5)} · ${t.admin.fieldLongitude} ${point.lng.toFixed(5)}`,
                );
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setMapOpen(false)}>{t.common.confirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
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
                if (deleteId) deleteProperty(deleteId);
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

export default PropertyManager;
