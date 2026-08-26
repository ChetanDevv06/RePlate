import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Leaf, TrendingDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodCard } from '@/components/food-card';
import { FoodCardSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { Suspense } from 'react';

async function FeaturedListings() {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: listings } = await supabase
    .from('food_listings')
    .select('*, business:businesses(name, location)')
    .eq('status', 'active')
    .gt('quantity', 0)
    .gt('pickup_deadline', now)
    .order('created_at', { ascending: false })
    .limit(6);

  if (!listings?.length) {
    return (
      <EmptyState
        title="No surplus food nearby"
        description="New listings usually appear around meal closing times. Check back soon!"
        actionLabel="Refresh listings"
        actionHref="/customer"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {listings.map((listing) => (
        <FoodCard
          key={listing.id}
          listing={listing as Parameters<typeof FoodCard>[0]['listing']}
          variant="customer"
        />
      ))}
    </div>
  );
}

export default async function CustomerHomePage() {
  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-emerald-700 p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <Leaf className="size-3.5" />
            Good food. Less waste.
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Good food.<br />Better prices.<br />Zero waste.
          </h1>
          <p className="text-green-100 text-base md:text-lg mb-6 max-w-sm">
            Discover surplus food from restaurants and cafeterias near you — at up to 50% off.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-green-50 font-semibold shadow-lg"
          >
            <Link href="/customer/explore">
              Explore surplus food
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute right-12 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
      </section>

      {/* Value propositions */}
      <section>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: TrendingDown, label: 'Up to 50% off', desc: 'Real discounts on real food' },
            { icon: Package, label: 'Fresh & safe', desc: 'Same-day pickup always' },
            { icon: Leaf, label: 'Help the planet', desc: 'Reduce food waste together' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-card border border-border/50">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="size-5 text-primary" />
              </div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Available Now</h2>
            <p className="text-sm text-muted-foreground">Fresh surplus food near you</p>
          </div>
          <Button variant="ghost" asChild className="text-primary hover:text-primary">
            <Link href="/customer/explore">
              See all
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          }
        >
          <FeaturedListings />
        </Suspense>
      </section>
    </div>
  );
}
