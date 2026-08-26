import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';

export const metadata: Metadata = { title: 'Reservation Confirmed — RePlate' };

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    code?: string;
    qty?: string;
    total?: string;
    name?: string;
    business?: string;
    pickup_start?: string;
    pickup_deadline?: string;
  }>;
}) {
  const sp = await searchParams;
  const { id } = await params;

  const orderCode = sp.code ?? 'RP-XXXXXX';
  const quantity = Number(sp.qty ?? 1);
  const total = Number(sp.total ?? 0);
  const foodName = sp.name ? decodeURIComponent(sp.name) : 'Your food';
  const businessName = sp.business ? decodeURIComponent(sp.business) : '';
  const pickupStart = sp.pickup_start ? decodeURIComponent(sp.pickup_start) : '';
  const pickupEnd = sp.pickup_deadline ? decodeURIComponent(sp.pickup_deadline) : '';

  const pickupDisplay = pickupStart && pickupEnd
    ? `${format(new Date(pickupStart), 'h:mm a')} – ${format(new Date(pickupEnd), 'h:mm a')}`
    : '';

  return (
    <div className="max-w-md mx-auto pt-8 animate-fade-in-up">
      <div className="text-center space-y-4 mb-8">
        <div className="size-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="size-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reservation Confirmed!</h1>
          <p className="text-muted-foreground mt-1">Your food is waiting for you.</p>
        </div>
      </div>

      {/* Pickup Code — prominent */}
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-center mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Pickup Code
        </p>
        <p className="text-4xl font-bold font-mono text-primary tracking-wider mb-3">
          {orderCode}
        </p>
        <p className="text-xs text-muted-foreground">
          Show this code at the counter when you arrive.
        </p>
      </div>

      {/* Order Summary */}
      <div className="rounded-xl border bg-card p-5 space-y-4 mb-6">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Order Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item</span>
            <span className="font-medium text-right">{quantity} × {foodName}</span>
          </div>
          {businessName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <span className="font-medium text-right">{businessName}</span>
            </div>
          )}
          {pickupDisplay && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup window</span>
              <span className="font-medium">{pickupDisplay}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" asChild>
          <Link href="/customer/orders">
            <ShoppingBag className="size-4 mr-2" />
            My Orders
          </Link>
        </Button>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/customer/explore">
            <ArrowLeft className="size-4 mr-2" />
            Explore More
          </Link>
        </Button>
      </div>
    </div>
  );
}
