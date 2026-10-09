import { describe, expect, it } from 'vitest';
import { fr } from '@/lib/i18n/dictionaries/fr';
import { ar } from '@/lib/i18n/dictionaries/ar';
import { properties } from '@/data/properties';
import { vehicles } from '@/data/vehicles';
import {
  buildGeneralMessage,
  buildPropertyMessage,
  buildVehicleMessage,
  whatsappUrl,
} from '@/lib/whatsapp';

const property = properties[0];
const vehicle = vehicles[0];

describe('buildPropertyMessage', () => {
  it('includes the reference, the title and the price', () => {
    const message = buildPropertyMessage(property, { locale: 'fr', t: fr });
    expect(message).toContain(property.reference);
    expect(message).toContain(property.title.fr);
    expect(message).toContain('Bonjour');
  });

  it('is translated in Arabic', () => {
    const message = buildPropertyMessage(property, { locale: 'ar', t: ar });
    expect(message).toContain(property.title.ar);
    expect(message).toContain(property.reference);
  });

  it('appends the requested dates and the customer details', () => {
    const message = buildPropertyMessage(property, {
      locale: 'fr',
      t: fr,
      fullName: 'Karim Benali',
      phone: '0555 12 34 56',
      startDate: '2026-11-01',
      endDate: '2026-11-05',
    });
    expect(message).toContain('2026-11-01');
    expect(message).toContain('2026-11-05');
    expect(message).toContain('Karim Benali');
    expect(message).toContain('0555 12 34 56');
    expect(message).toContain('4 nuits');
  });
});

describe('buildVehicleMessage', () => {
  it('includes the vehicle reference and daily price', () => {
    const message = buildVehicleMessage(vehicle, { locale: 'fr', t: fr });
    expect(message).toContain(vehicle.reference);
    expect(message).toContain(vehicle.model);
  });
});

describe('buildGeneralMessage', () => {
  it('includes the subject', () => {
    expect(buildGeneralMessage('Location F3', { locale: 'fr', t: fr })).toContain('Location F3');
  });
});

describe('whatsappUrl', () => {
  it('builds a wa.me deep link with the encoded message', () => {
    const url = whatsappUrl('Bonjour GW', '213600000000');
    expect(url.startsWith('https://wa.me/213600000000?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Bonjour GW'));
  });
});
