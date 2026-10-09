import {
  Building2,
  Car,
  CircleUser,
  Contact,
  Home,
  Info,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  key: 'home' | 'properties' | 'cars' | 'map' | 'services' | 'about' | 'contact' | 'admin';
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', key: 'home', icon: Home },
  { href: '/properties', key: 'properties', icon: Building2 },
  { href: '/cars', key: 'cars', icon: Car },
  { href: '/map', key: 'map', icon: MapIcon },
  { href: '/services', key: 'services', icon: LayoutGrid },
  { href: '/about', key: 'about', icon: Info },
  { href: '/contact', key: 'contact', icon: Contact },
];

export const ADMIN_NAV_ITEM: NavItem = { href: '/admin', key: 'admin', icon: CircleUser };
