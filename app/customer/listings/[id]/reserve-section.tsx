'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantitySelector } from '@/components/quantity-selector';
import { formatCurrency } from '@/lib/constants';
import { calculateOrderTotal, calculateCommission } from '@/lib/calculations';
import { reserveFood } from '@/app/actions/orders';
import { ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

interface ReserveSectionProps {
  listing: {
    id: string;
    name: string;
    discounted_price: number;
    quantity: number;
    pickup_start: string;
    pickup_deadline: string;
  };
  businessName?: string;
}

export function ReserveSection({ listing, businessName }: ReserveSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const total = calculateOrderTotal(listing.discounted_price, quantity);
  const commission = calculateCommission(total);

  const handleReserve = () => {
    startTransition(async () => {
      const result = await reserveFood(listing.id, quantity);
      if (result.success && result.data) {
        router.push(
          `/customer/orders/${result.data.order_id}/confirmation?` +
          `code=${result.data.order_code}&` +
          `qty=${result.data.quantity}&` +
          `total=${result.data.total_amount}&` +
          `name=${encodeURIComponent(listing.name)}&` +
          `business=${encodeURIComponent(businessName ?? '')}&` +
          `pickup_start=${encodeURIComponent(listing.pickup_start)}&` +
          `pickup_deadline=${encodeURIComponent(listing.pickup_deadline)}`
        );
      } else {
        toast.error(
          result.error ??
          "We couldn't complete that reservation. The item may have just sold out. Please try again."
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div>
        <p className="text-sm font-medium mb-2">Select Quantity</p>
        <QuantitySelector
          value={quantity}
          min={1}
          max={listing.quantity}
          onChange={setQuantity}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Max {listing.quantity} available
        </p>
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{formatCurrency(listing.discounted_price)} × {quantity}</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Reserve button */}
      <Button
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
        onClick={handleReserve}
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Reserving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            Reserve for {formatCurrency(total)}
          </span>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Show your pickup code at the counter. No payment required online.
      </p>
    </div>
  );
}
