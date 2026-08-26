'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/price-display';
import { formatCurrency } from '@/lib/constants';
import type { FoodListing } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';

interface FoodCardProps {
  listing: FoodListing & { business?: { name: string; location: string } };
  className?: string;
  variant?: 'customer' | 'business';
  onReserve?: () => void;
}

function formatPickupWindow(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeStr = `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`;
  if (isToday(startDate)) return `Today · ${timeStr}`;
  if (isTomorrow(startDate)) return `Tomorrow · ${timeStr}`;
  return `${format(startDate, 'MMM d')} · ${timeStr}`;
}

export function FoodCard({ listing, className, variant = 'customer', onReserve }: FoodCardProps) {
  const isExpired = new Date(listing.pickup_deadline) < new Date();
  const isUnavailable = listing.status !== 'active' || listing.quantity === 0 || isExpired;

  return (
    <Card
      className={cn(
        'food-card overflow-hidden border border-border/60 shadow-sm',
        isUnavailable && 'opacity-70',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <span className="text-4xl">🍱</span>
          </div>
        )}
        {/* Discount badge */}
        {!isUnavailable && (
          <div className="absolute top-2 left-2">
            <span className="discount-badge">
              {Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100)}% OFF
            </span>
          </div>
        )}
        {/* Status overlay for unavailable */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
              {listing.quantity === 0 ? 'Sold Out' : isExpired ? 'Expired' : 'Unavailable'}
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Name */}
        <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1">
          {listing.name}
        </h3>

        {/* Business info */}
        {listing.business && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{listing.business.name} · {listing.business.location}</span>
          </div>
        )}

        {/* Price */}
        <PriceDisplay
          originalPrice={listing.original_price}
          discountedPrice={listing.discounted_price}
          size="sm"
        />

        {/* Quantity & pickup */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="size-3" />
            {listing.quantity} left
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatPickupWindow(listing.pickup_start, listing.pickup_deadline)}
          </span>
        </div>

        {/* Action */}
        {variant === 'customer' && (
          <div className="flex gap-2 pt-1">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Link href={`/customer/listings/${listing.id}`}>
                View Details
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-primary hover:bg-primary/90"
              disabled={isUnavailable}
              onClick={onReserve}
              asChild={!onReserve && !isUnavailable}
            >
              {!onReserve && !isUnavailable ? (
                <Link href={`/customer/listings/${listing.id}`}>Reserve</Link>
              ) : (
                'Reserve'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
