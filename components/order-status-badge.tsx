'use client';

import { ORDER_STATUS_LABELS } from '@/lib/constants';
import type { OrderStatus, ListingStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const badgeClass = {
    reserved: 'badge-reserved',
    ready: 'badge-ready',
    collected: 'badge-collected',
    cancelled: 'badge-cancelled',
  }[status] ?? 'badge-cancelled';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeClass,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface ListingStatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function ListingStatusBadge({ status, className }: ListingStatusBadgeProps) {
  const badgeClass = {
    active: 'badge-active',
    sold_out: 'badge-sold-out',
    expired: 'badge-expired',
    paused: 'badge-paused',
  }[status] ?? 'badge-expired';

  const labels: Record<string, string> = {
    active: 'Active',
    sold_out: 'Sold Out',
    expired: 'Expired',
    paused: 'Paused',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeClass,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {labels[status] ?? status}
    </span>
  );
}
