import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/constants';
import { formatWeight } from '@/lib/calculations';
import { StatCard } from '@/components/stat-card';
import { EmptyState } from '@/components/empty-state';
import { BarChart3, TrendingUp, UtensilsCrossed, Leaf, DollarSign } from 'lucide-react';
import { AnalyticsCharts } from './analytics-charts';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics — RePlate Business' };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses').select('id').eq('owner_id', user.id).single();

  if (!business) redirect('/business');

  // Get impact stats
  const { data: stats } = await supabase.rpc('get_business_impact_stats', {
    p_business_id: business.id,
  });

  const impactStats = stats as {
    total_orders: number;
    meals_rescued: number;
    revenue_recovered: number;
    replate_revenue: number;
    estimated_waste_avoided_kg: number;
    active_listings: number;
  } | null;

  // Fetch collected orders for charts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: collectedOrders } = await supabase
    .from('orders')
    .select(`
      id,
      quantity,
      total_amount,
      commission,
      collected_at,
      created_at,
      listing:food_listings!inner(name, business_id)
    `)
    .eq('listing.business_id', business.id)
    .eq('status', 'collected')
    .gte('collected_at', thirtyDaysAgo.toISOString())
    .order('collected_at', { ascending: true });

  // Top surplus items
  const { data: topItems } = await supabase
    .from('orders')
    .select(`
      quantity,
      total_amount,
      listing:food_listings!inner(id, name, business_id)
    `)
    .eq('listing.business_id', business.id)
    .eq('status', 'collected');

  // Aggregate top items
  const itemMap = new Map<string, { name: string; orders: number; quantity: number; revenue: number }>();
  topItems?.forEach((order) => {
    const listing = order.listing as { id: string; name: string } | { id: string; name: string }[] | null;
    const listingItem = Array.isArray(listing) ? listing[0] : listing;
    if (!listingItem) return;
    const existing = itemMap.get(listingItem.id);
    if (existing) {
      existing.orders += 1;
      existing.quantity += order.quantity;
      existing.revenue += order.total_amount;
    } else {
      itemMap.set(listingItem.id, {
        name: listingItem.name,
        orders: 1,
        quantity: order.quantity,
        revenue: order.total_amount,
      });
    }
  });

  const topItemsList = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const hasData = (impactStats?.total_orders ?? 0) > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your food rescue impact — derived from real completed orders.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 className="size-7" />}
          title="Not enough data yet"
          description="Complete your first orders to see analytics here. Create a listing and let customers reserve food!"
          actionLabel="Create a Listing"
          actionHref="/business/listings/new"
        />
      ) : (
        <>
          {/* Summary Stats */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Collected Orders"
                value={impactStats?.total_orders ?? 0}
                icon={BarChart3}
                colorVariant="blue"
              />
              <StatCard
                title="Meals Rescued"
                value={(impactStats?.meals_rescued ?? 0).toLocaleString('en-IN')}
                icon={UtensilsCrossed}
                colorVariant="green"
              />
              <StatCard
                title="Revenue Recovered"
                value={formatCurrency(impactStats?.revenue_recovered ?? 0)}
                icon={TrendingUp}
                colorVariant="emerald"
              />
              <StatCard
                title="RePlate Commission"
                value={formatCurrency(impactStats?.replate_revenue ?? 0)}
                icon={DollarSign}
                colorVariant="amber"
              />
              <StatCard
                title="Waste Avoided"
                value={formatWeight(impactStats?.estimated_waste_avoided_kg ?? 0)}
                subtitle="Estimated at 0.25 kg/meal"
                icon={Leaf}
                colorVariant="green"
              />
            </div>
          </section>

          {/* Charts */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Trends (Last 30 Days)
            </h2>
            <AnalyticsCharts orders={collectedOrders ?? []} />
          </section>

          {/* Top Items */}
          {topItemsList.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Top Surplus Items
              </h2>
              <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Food Item</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Orders</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Qty Rescued</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topItemsList.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4 text-right tabular-nums">{item.orders}</td>
                        <td className="p-4 text-right tabular-nums">{item.quantity}</td>
                        <td className="p-4 text-right tabular-nums font-semibold text-primary">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                * Estimated waste avoided: {formatWeight((impactStats?.meals_rescued ?? 0) * 0.25)} using RePlate&apos;s configurable average food-weight assumption.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
