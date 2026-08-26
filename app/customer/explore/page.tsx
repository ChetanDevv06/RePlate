import { createClient } from '@/lib/supabase/server';
import { FoodCard } from '@/components/food-card';
import { EmptyState } from '@/components/empty-state';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Explore — RePlate' };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createClient();
  const now = new Date().toISOString();

  const query = supabase
    .from('food_listings')
    .select('*, business:businesses(name, location)')
    .eq('status', 'active')
    .gt('quantity', 0)
    .gt('pickup_deadline', now)
    .order('created_at', { ascending: false });

  // Apply filter
  if (filter === 'under100') {
    query.lte('discounted_price', 100);
  } else if (filter === 'bigdiscount') {
    // 30%+ off — filter client-side since it's computed
  }

  const { data: listings } = await query;

  // Apply 30%+ discount filter (computed)
  const filteredListings = filter === 'bigdiscount'
    ? listings?.filter((l) => ((l.original_price - l.discounted_price) / l.original_price) >= 0.3)
    : listings;

  const filters = [
    { key: undefined, label: 'All' },
    { key: 'bigdiscount', label: '30%+ OFF' },
    { key: 'under100', label: 'Under ₹100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Explore Surplus Food</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredListings?.length ?? 0} listing{filteredListings?.length !== 1 ? 's' : ''} available now
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <a
            key={f.key ?? 'all'}
            href={f.key ? `/customer/explore?filter=${f.key}` : '/customer/explore'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f.key || (!filter && !f.key)
                ? 'bg-primary text-white border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {!filteredListings?.length ? (
        <EmptyState
          icon={<Search className="size-7" />}
          title="No surplus food available"
          description="Check back later — new listings appear around meal closing times."
          actionLabel="Clear filters"
          actionHref="/customer/explore"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredListings.map((listing) => (
            <FoodCard
              key={listing.id}
              listing={listing as Parameters<typeof FoodCard>[0]['listing']}
              variant="customer"
            />
          ))}
        </div>
      )}
    </div>
  );
}
