'use client';

import { MessageCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { whatsappUrl } from '@/lib/whatsapp';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Opens WhatsApp with a pre-filled message.
 *
 * This is a real integration as far as a link can be: no message is sent from
 * our side, the customer reviews and sends it themselves. The destination
 * number comes from NEXT_PUBLIC_WHATSAPP_NUMBER (see README).
 */
export function WhatsAppButton({
  message,
  label,
  variant = 'whatsapp',
  size = 'md',
  className,
  fullWidth,
  children,
}: {
  message: string;
  label?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={cn(className)}
    >
      <a
        href={whatsappUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label ?? `${t.common.whatsapp} — ${message.slice(0, 60)}`}
      >
        <MessageCircle aria-hidden />
        <span>{children ?? label ?? t.common.whatsapp}</span>
      </a>
    </Button>
  );
}

export default WhatsAppButton;
