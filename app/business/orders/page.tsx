import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { ClipboardList } from 'lucide-react';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { UpdateOrderStatusButton } from './update-order-status-button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Orders — RePlate Business' };

export default async function BusinessOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses').select('id').eq('owner_id', user.id).single();

  if (!business) redirect('/business');

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      listing:food_listings!inner(
        id,
        name,
        image_url,
        discounted_price,
        business_id
      ),
      customer:profiles!orders_customer_id_fkey(name, email)
    `)
    .eq('listing.business_id', business.id)
    .order('created_at', { ascending: false });

  const activeOrders = orders?.filter((o) => o.status !== 'collected' && o.status !== 'cancelled') ?? [];
  const completedOrders = orders?.filter((o) => o.status === 'collected' || o.status === 'cancelled') ?? [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeOrders.length} active · {completedOrders.length} completed
        </p>
      </div>

      {!orders?.length ? (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title="No orders yet"
          description="Once customers start reserving your food listings, orders will appear here."
        />
      ) : (
        <div className="space-y-8">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Active Orders ({activeOrders.length})
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Completed Orders ({completedOrders.length})
              </h2>
              <div className="space-y-3">
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Record<string, unknown> }) {
  const listing = order.listing as { name: string; image_url: string | null; discounted_price: number } | null;
  const customer = order.customer as { name: string; email: string } | null;

  return (
    <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Image */}
          <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0">
            {listing?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🍱</div>
            )}
          </div>

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <code className="text-sm font-bold font-mono bg-muted px-2 py-0.5 rounded">
                {order.order_code as string}
              </code>
              <OrderStatusBadge status={order.status as 'reserved' | 'ready' | 'collected' | 'cancelled'} />
            </div>
            <p className="font-medium text-sm">{listing?.name} × {order.quantity as number}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(order.total_amount as number)} · Customer: {customer?.name ?? 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground">
              Reserved {format(new Date(order.created_at as string), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        {/* Status action buttons */}
        <div className="shrink-0">
          {order.status === 'reserved' && (
            <UpdateOrderStatusButton
              orderId={order.id as string}
              newStatus="ready"
              label="Mark Ready"
              variant="default"
            />
          )}
          {order.status === 'ready' && (
            <UpdateOrderStatusButton
              orderId={order.id as string}
              newStatus="collected"
              label="Mark Collected"
              variant="default"
            />
          )}
          {order.status === 'collected' && (
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              ✓ Collected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
