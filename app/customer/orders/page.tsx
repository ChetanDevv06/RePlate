import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { formatCurrency } from '@/lib/constants';
import { ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Orders — RePlate' };

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      listing:food_listings(
        id,
        name,
        image_url,
        discounted_price,
        pickup_start,
        pickup_deadline,
        business:businesses(name, location)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders?.length ?? 0} order{orders?.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {!orders?.length ? (
        <EmptyState
          icon={<ShoppingBag className="size-7" />}
          title="No orders yet"
          description="Discover and reserve surplus food near you!"
          actionLabel="Explore food"
          actionHref="/customer/explore"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const listing = order.listing as {
              id: string;
              name: string;
              image_url: string | null;
              discounted_price: number;
              pickup_start: string;
              pickup_deadline: string;
              business: { name: string; location: string } | null;
            } | null;

            return (
              <div key={order.id} className="rounded-xl border bg-card p-5 space-y-4">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="size-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    {listing?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <OrderStatusBadge status={order.status as 'reserved' | 'ready' | 'collected' | 'cancelled'} />
                    </div>
                    <p className="font-semibold">{listing?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing?.business?.name} · {listing?.business?.location}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-muted-foreground">{order.quantity} item{order.quantity !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Pickup code — shown prominently for ready/reserved */}
                {(order.status === 'reserved' || order.status === 'ready') && (
                  <div className={`rounded-xl p-4 text-center ${order.status === 'ready' ? 'bg-blue-50 border border-blue-200' : 'bg-muted/50'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Pickup Code</p>
                    <p className="text-2xl font-bold font-mono text-primary">{order.order_code}</p>
                    {order.status === 'ready' && (
                      <p className="text-xs text-blue-600 font-medium mt-1">🎉 Ready for pickup — head over now!</p>
                    )}
                    {listing && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Pickup: {format(new Date(listing.pickup_start), 'h:mm a')} – {format(new Date(listing.pickup_deadline), 'h:mm a')}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Order ID: <code className="font-mono text-foreground font-semibold">{order.order_code}</code></span>
                    <span>·</span>
                    <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                  </div>

                  <ReportIssueDialog
                    orderId={order.id}
                    orderCode={order.order_code}
                    businessName={listing?.business?.name}
                    triggerButton={
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 px-2">
                        Report Issue
                      </Button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
