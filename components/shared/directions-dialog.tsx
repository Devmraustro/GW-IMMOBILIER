'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  X,
} from 'lucide-react';
import type { GeoPoint } from '@/types';
import { useI18n } from '@/lib/i18n';
import {
  formatLatLng,
  googleDirectionsUrl,
  googleMapsSearchUrl,
  osmDirectionsUrl,
  requestCurrentPosition,
} from '@/lib/geo';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * "Itinéraire" action.
 *
 * We do not build a routing engine: the link hands the destination to Google
 * Maps, which computes the route, the duration and the live navigation. The
 * starting point can be the device position — requested only after the user
 * explicitly presses the button — or an address typed by the customer. If
 * geolocation is denied, the customer can still navigate from a typed address
 * or let their Maps app choose the origin.
 */
export function DirectionsDialog({
  destination,
  destinationLabel,
  variant = 'ink',
  size = 'md',
  fullWidth,
  className,
  label,
}: {
  destination: GeoPoint;
  destinationLabel: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  fullWidth?: boolean;
  className?: string;
  label?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<string>('');
  const [userPoint, setUserPoint] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<'denied' | 'unavailable' | 'unsupported' | null>(null);

  const useCurrentLocation = async () => {
    setLocating(true);
    setError(null);
    const result = await requestCurrentPosition();
    setLocating(false);
    if (result.ok) {
      setUserPoint(result.point);
      setOrigin(formatLatLng(result.point));
    } else {
      setError(
        result.error === 'unsupported' || result.error === 'timeout'
          ? result.error === 'timeout'
            ? 'unavailable'
            : 'unsupported'
          : result.error,
      );
    }
  };

  const finalOrigin = userPoint ? formatLatLng(userPoint) : origin.trim() || null;
  const url = googleDirectionsUrl(formatLatLng(destination), finalOrigin);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} fullWidth={fullWidth} className={className}>
          <Navigation aria-hidden />
          {label ?? t.properties.directions}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.directions.title}</DialogTitle>
          <DialogDescription>{t.directions.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-sand-50 p-4">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-ink-400">{t.common.area}</p>
              <p className="truncate text-sm font-medium text-ink-900">{destinationLabel}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-400">
                {formatLatLng(destination)}
              </p>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-ink-800">
              {t.directions.fromCurrent}
            </legend>

            <Button
              type="button"
              variant={userPoint ? 'subtle' : 'outline'}
              size="sm"
              onClick={useCurrentLocation}
              disabled={locating}
              className="w-full"
            >
              {locating ? <Loader2 className="animate-spin" aria-hidden /> : <Navigation aria-hidden />}
              {userPoint ? t.mapPage.locationFound : t.directions.useCurrent}
            </Button>

            {error ? (
              <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {error === 'denied'
                  ? t.directions.deniedNote
                  : error === 'unsupported'
                    ? t.mapPage.geolocationUnsupported
                    : t.mapPage.locationUnavailableText}
              </p>
            ) : null}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="directions-origin">{t.directions.fromManual}</Label>
            <div className="relative">
              <Input
                id="directions-origin"
                value={origin}
                onChange={(event) => {
                  setOrigin(event.target.value);
                  setUserPoint(null);
                }}
                placeholder={t.directions.manualPlaceholder}
                className={cn('pe-9')}
              />
              {origin ? (
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('');
                    setUserPoint(null);
                  }}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-900"
                  aria-label={t.common.reset}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
            <p className="text-xs text-ink-400">{t.directions.startEmpty}</p>
          </div>

          <p className="rounded-lg border border-dashed border-ink-200 px-3 py-2 text-xs leading-relaxed text-ink-500">
            {t.directions.permissionNote}
          </p>

          <div className="space-y-2">
            <Button asChild fullWidth size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                {t.directions.open}
              </a>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" fullWidth>
                <a
                  href={googleMapsSearchUrl(destinationLabel)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.directions.googleFallback}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" fullWidth>
                <a
                  href={osmDirectionsUrl(destination, userPoint)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.directions.osmFallback}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DirectionsDialog;
