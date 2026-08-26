import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, UtensilsCrossed, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { ListingStatusBadge } from '@/components/order-status-badge';
import { PriceDisplay } from '@/components/price-display';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import { DeleteListingButton } from './delete-listing-button';

export const metadata: Metadata = { title: 'Listings — RePlate Business' };

export default async function BusinessListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses').select('id').eq('owner_id', user.id).single();

  if (!business) redirect('/business');

  const { data: listings } = await supabase
    .from('food_listings')
    .select('*, orders(count)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {listings?.length ?? 0} listing{listings?.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button asChild>
          <Link href="/business/listings/new">
            <Plus className="size-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {!listings?.length ? (
        <EmptyState
          icon={<UtensilsCrossed className="size-7" />}
          title="Your surplus shelf is empty"
          description="List unsold food before closing and turn potential waste into revenue."
          actionLabel="Create your first listing"
          actionHref="/business/listings/new"
        />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const orderCount = (listing.orders as unknown as { count: number }[])?.[0]?.count ?? 0;
            const isExpired = new Date(listing.pickup_deadline) < new Date();
            const effectiveStatus = isExpired && listing.status === 'active' ? 'expired' : listing.status;

            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Image */}
                    <div className="size-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.image_url}
                          alt={listing.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{listing.name}</h3>
                        <ListingStatusBadge status={effectiveStatus as 'active' | 'sold_out' | 'expired' | 'paused'} />
                      </div>
                      <PriceDisplay
                        originalPrice={listing.original_price}
                        discountedPrice={listing.discounted_price}
                        size="sm"
                        className="mt-1"
                      />
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span>{listing.quantity} / {listing.initial_quantity} remaining</span>
                        <span>·</span>
                        <span>{orderCount} order{orderCount !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>Pickup {format(new Date(listing.pickup_deadline), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild className="h-8">
                        <Link href={`/business/listings/${listing.id}`}>
                          <Edit className="size-3.5 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteListingButton listingId={listing.id} listingName={listing.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
