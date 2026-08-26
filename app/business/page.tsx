import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import {
  TrendingUp, ShoppingBag, Leaf, DollarSign, UtensilsCrossed, Clock, Package
} from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { PredictionCard } from '@/components/prediction-card';
import { formatCurrency } from '@/lib/constants';
import { formatWeight } from '@/lib/calculations';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function BusinessDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  // If business record is missing for this business owner, create a default one
  if (!business) {
    const { data: newBusiness } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: 'RUAS Campus Canteen',
        location: 'Bangalore',
        address: 'RUAS Campus, Peenya, Bangalore 560058',
        contact: '+91 98765 43210',
      })
      .select('*')
      .single();

    business = newBusiness;
  }

  if (!business) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <h2 className="text-xl font-semibold">Set Up Your Business</h2>
        <p className="text-muted-foreground text-sm">
          Please reload or create a business profile to start managing surplus listings.
        </p>
      </div>
    );
  }

  // Fetch impact stats via RPC
  const { data: stats } = await supabase.rpc('get_business_impact_stats', {
    p_business_id: business.id,
  });

  // Fetch today's orders count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch total remaining quantity across active listings
  const { data: activeListings } = await supabase
    .from('food_listings')
    .select('quantity')
    .eq('business_id', business.id)
    .eq('status', 'active')
    .gt('quantity', 0);

  const mealsRemaining = activeListings?.reduce((sum, l) => sum + (l.quantity || 0), 0) ?? 0;

  // Fetch today's orders count for this business
  const { count: ordersToday } = await supabase
    .from('orders')
    .select('id, food_listings!inner(business_id)', { count: 'exact', head: true })
    .eq('food_listings.business_id', business.id)
    .gte('created_at', today.toISOString());

  const impactStats = stats as {
    total_orders: number;
    meals_rescued: number;
    revenue_recovered: number;
    replate_revenue: number;
    estimated_waste_avoided_kg: number;
    active_listings: number;
  } | null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {business.name} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s how you&apos;re reducing food waste today — {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/business/listings/new">
            <UtensilsCrossed className="size-4 mr-2" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Impact Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Impact Overview — All Time
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue Recovered"
            value={formatCurrency(impactStats?.revenue_recovered ?? 0)}
            subtitle="From collected orders"
            icon={TrendingUp}
            colorVariant="green"
          />
          <StatCard
            title="Meals Rescued"
            value={(impactStats?.meals_rescued ?? 0).toLocaleString('en-IN')}
            subtitle="Items collected"
            icon={UtensilsCrossed}
            colorVariant="emerald"
          />
          <StatCard
            title="Waste Avoided"
            value={formatWeight(impactStats?.estimated_waste_avoided_kg ?? 0)}
            subtitle="Estimated at 0.25 kg/meal"
            icon={Leaf}
            colorVariant="amber"
          />
          <StatCard
            title="RePlate Revenue"
            value={formatCurrency(impactStats?.replate_revenue ?? 0)}
            subtitle="Platform commission (10%)"
            icon={DollarSign}
            colorVariant="blue"
          />
        </div>
      </section>

      {/* Today Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Today at a Glance
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="Active Listings"
            value={impactStats?.active_listings ?? 0}
            icon={ShoppingBag}
            colorVariant="green"
          />
          <StatCard
            title="Orders Today"
            value={ordersToday ?? 0}
            icon={Clock}
            colorVariant="blue"
          />
          <StatCard
            title="Meals Remaining"
            value={mealsRemaining}
            subtitle="Available for pickup"
            icon={Package}
            colorVariant="amber"
          />
        </div>
      </section>

      {/* Smart Prediction */}
      <section className="max-w-2xl">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Smart Prediction
        </h2>
        <PredictionCard />
        <p className="text-xs text-muted-foreground mt-2">
          Use Smart Prediction while creating a listing to apply discount recommendations automatically.
        </p>
      </section>
    </div>
  );
}
