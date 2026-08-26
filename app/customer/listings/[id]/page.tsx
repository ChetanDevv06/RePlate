import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Clock, Package, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/price-display';
import { ListingStatusBadge } from '@/components/order-status-badge';
import { formatCurrency } from '@/lib/constants';
import { calculateCommission } from '@/lib/calculations';
import { format, isToday, isTomorrow } from 'date-fns';
import Link from 'next/link';
import { ReserveSection } from './reserve-section';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from('food_listings').select('name').eq('id', id).single();
  return { title: listing ? `${listing.name} — RePlate` : 'Food Listing — RePlate' };
}

function formatPickupWindow(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const timeStr = `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`;
  if (isToday(startDate)) return `Today · ${timeStr}`;
  if (isTomorrow(startDate)) return `Tomorrow · ${timeStr}`;
  return `${format(startDate, 'MMMM d')} · ${timeStr}`;
}

export default async function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: listing } = await supabase
    .from('food_listings')
    .select('*, business:businesses(name, location, address, contact)')
    .eq('id', id)
    .single();

  if (!listing) notFound();

  const business = listing.business as { name: string; location: string; address: string | null; contact: string | null } | null;
  const isExpired = new Date(listing.pickup_deadline) < new Date();
  const isUnavailable = listing.status !== 'active' || listing.quantity === 0 || isExpired;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Back */}
      <Link
        href="/customer/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Explore
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-muted h-72 md:h-auto md:min-h-80">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🍱</div>
          )}
          {!isUnavailable && (
            <div className="absolute top-4 left-4">
              <span className="discount-badge text-sm px-3 py-1">
                {Math.round(((listing.original_price - listing.discounted_price) / listing.original_price) * 100)}% OFF
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <ListingStatusBadge
              status={isExpired ? 'expired' : listing.status as 'active' | 'sold_out' | 'expired' | 'paused'}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{listing.name}</h1>
            {business && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                <MapPin className="size-3.5 shrink-0" />
                <span>{business.name} · {business.location}</span>
              </div>
            )}
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
          )}

          <PriceDisplay
            originalPrice={listing.original_price}
            discountedPrice={listing.discounted_price}
            size="lg"
          />

          <Separator />

          {/* Meta info */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="size-4 text-primary shrink-0" />
              <span><strong className="text-foreground">{listing.quantity}</strong> portions available</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 text-primary shrink-0" />
              <span>Pickup: <strong className="text-foreground">{formatPickupWindow(listing.pickup_start, listing.pickup_deadline)}</strong></span>
            </div>
            {business?.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                <span>{business.address}</span>
              </div>
            )}
          </div>

          {/* Dietary & Allergen Disclosures */}
          <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {listing.dietary_type === 'veg' && '🟢 Vegetarian'}
                {listing.dietary_type === 'non_veg' && '🔴 Non-Vegetarian'}
                {listing.dietary_type === 'vegan' && '🌱 100% Vegan'}
                {listing.dietary_type === 'egg' && '🟡 Contains Egg'}
                {!listing.dietary_type && '🟢 Vegetarian'}
              </span>
              <span className="text-[11px] text-muted-foreground">FSSAI Certified Partner</span>
            </div>
            {listing.allergens && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">Allergens:</strong> {listing.allergens}
              </p>
            )}
            {listing.food_handling_notes && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">Handling:</strong> {listing.food_handling_notes}
              </p>
            )}
          </div>

          <Separator />

          {/* Reservation section */}
          {isUnavailable ? (
            <div className="rounded-xl bg-muted p-4 text-sm text-center text-muted-foreground">
              {listing.quantity === 0 ? 'This item has sold out.' : isExpired ? 'The pickup window has passed.' : 'This listing is currently unavailable.'}
            </div>
          ) : (
            <ReserveSection
              listing={{
                id: listing.id,
                name: listing.name,
                discounted_price: listing.discounted_price,
                quantity: listing.quantity,
                pickup_start: listing.pickup_start,
                pickup_deadline: listing.pickup_deadline,
              }}
              businessName={business?.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
