/**
 * GW Immobilier — domain models.
 *
 * These types are the single source of truth for listings, vehicles, inquiries
 * and reservations. They are intentionally transport-agnostic so the same shapes
 * can later be served by a real API / database without touching the UI layer.
 */

export type Locale = 'fr' | 'ar';

/** A string translated into every supported locale. */
export type Translated = Record<Locale, string>;

/* -------------------------------------------------------------------------- */
/* Geography                                                                   */
/* -------------------------------------------------------------------------- */

export type AreaId =
  | 'bab-ezzouar'
  | 'cheraga'
  | 'draria'
  | 'dely-ibrahim'
  | 'el-achour'
  | 'douaouda-marine'
  | 'bordj-el-kiffan'
  | 'ouled-fayet'
  | 'dar-el-beida';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Area {
  id: AreaId;
  slug: AreaId;
  /** Commune / town name, translated. */
  name: Translated;
  /** Wilaya the commune administratively belongs to. */
  wilaya: Translated;
  /** Geocoded town centre — used to frame the map and to seed listing markers. */
  center: GeoPoint;
  /** Suggested zoom level when framing a single listing in this area. */
  zoom: number;
}

/** How precise a marker coordinate is. Surfaced in the UI, never hidden. */
export type CoordinatePrecision = 'exact' | 'approximate' | 'area';

/* -------------------------------------------------------------------------- */
/* Properties                                                                  */
/* -------------------------------------------------------------------------- */

export type PropertyType = 'F2' | 'F3' | 'F4' | 'F5' | 'Studio' | 'Villa' | 'Bureau';

export type ListingCategory = 'rent' | 'sale' | 'exchange';

/** Billing cadence of the advertised price. */
export type RentalPeriod = 'daily' | 'monthly' | 'annual';

export type PriceUnit = 'day' | 'month' | 'year' | 'total';

export type AvailabilityStatus = 'available' | 'reserved' | 'unavailable';

export interface Availability {
  status: AvailabilityStatus;
  /** ISO date (YYYY-MM-DD) the listing becomes free. */
  availableFrom: string;
  /** Optional ISO date the listing stops being free. */
  availableTo?: string;
  /** Human readable note, translated (e.g. "Libre à partir du 12/09"). */
  note?: Translated;
}

export interface Property {
  id: string;
  slug: string;
  /** Human friendly business reference, e.g. "GWI-ALG-0142". */
  reference: string;
  title: Translated;
  description: Translated;
  type: PropertyType;
  category: ListingCategory;
  /** Rental billing cadence. Undefined for sale listings. */
  rentalPeriod?: RentalPeriod;
  price: number;
  priceUnit: PriceUnit;
  currency: 'DZD';
  area: AreaId;
  /** Street-level hint. Deliberately vague for demonstration listings. */
  address: Translated;
  coordinates: GeoPoint;
  coordinatePrecision: CoordinatePrecision;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  furnished: boolean;
  amenities: string[];
  images: string[];
  availability: Availability;
  /** Rental conditions, translated. */
  conditions: Translated[];
  featured: boolean;
  /** Every seeded listing is fictional demonstration data. */
  isDemo: boolean;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Vehicles                                                                    */
/* -------------------------------------------------------------------------- */

export type VehicleCategory = 'economique' | 'berline' | 'suv' | 'luxe' | 'utilitaire';

export type Transmission = 'manuelle' | 'automatique';

export type FuelType = 'essence' | 'diesel' | 'hybride' | 'electrique';

export interface Vehicle {
  id: string;
  slug: string;
  reference: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  dailyPrice: number;
  currency: 'DZD';
  images: string[];
  features: string[];
  available: boolean;
  pickup: {
    area: AreaId;
    address: Translated;
    coordinates: GeoPoint;
  };
  conditions: Translated[];
  description: Translated;
  featured: boolean;
  isDemo: boolean;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Inquiries                                                                   */
/* -------------------------------------------------------------------------- */

export type InquiryType = 'property' | 'vehicle' | 'general';

export type InquiryStatus = 'new' | 'contacted' | 'confirmed' | 'cancelled';

export type InquiryChannel = 'whatsapp' | 'form';

export interface Inquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  channel: InquiryChannel;
  fullName: string;
  phone: string;
  email?: string;
  message: string;
  propertyId?: string;
  vehicleId?: string;
  /** ISO dates for rental requests. */
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Reservations                                                                */
/* -------------------------------------------------------------------------- */

export type ReservationStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  /** 'property' | 'vehicle' */
  kind: 'property' | 'vehicle';
  itemId: string;
  itemReference: string;
  itemTitle: Translated;
  customerName: string;
  phone: string;
  startDate: string;
  endDate: string;
  /** Total rental amount in DZD. */
  amount: number;
  /** Deposit already received in DZD. */
  deposit: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Filters                                                                     */
/* -------------------------------------------------------------------------- */

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'surface-desc';

export interface PropertyFilters {
  query: string;
  areas: AreaId[];
  types: PropertyType[];
  periods: RentalPeriod[];
  categories: ListingCategory[];
  minPrice: number;
  maxPrice: number;
  furnished: 'all' | 'furnished' | 'unfurnished';
  availableOnly: boolean;
  bedrooms: number;
  availableFrom?: string;
  availableTo?: string;
}

export interface VehicleFilters {
  query: string;
  categories: VehicleCategory[];
  minPrice: number;
  maxPrice: number;
  transmission: 'all' | Transmission;
  seats: number;
  availableOnly: boolean;
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export interface Service {
  id: string;
  slug: string;
  title: Translated;
  summary: Translated;
  description: Translated;
  bullets: Translated[];
  href: string;
  icon: string;
}
