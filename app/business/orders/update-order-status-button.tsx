'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/app/actions/orders';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

interface UpdateOrderStatusButtonProps {
  orderId: string;
  newStatus: 'ready' | 'collected' | 'cancelled';
  label: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function UpdateOrderStatusButton({
  orderId,
  newStatus,
  label,
  variant = 'default',
}: UpdateOrderStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        const messages = {
          ready: 'Order marked as Ready for Pickup!',
          collected: 'Order marked as Collected! Impact stats updated.',
          cancelled: 'Order cancelled.',
        };
        toast.success(messages[newStatus]);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update order');
      }
    });
  };

  return (
    <Button
      size="sm"
      variant={variant}
      onClick={handleUpdate}
      disabled={isPending}
      className="h-8 text-xs"
    >
      {isPending ? (
        <span className="flex items-center gap-1.5">
          <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Updating...
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          {newStatus === 'ready' ? <Clock className="size-3" /> : <CheckCircle className="size-3" />}
          {label}
        </span>
      )}
    </Button>
  );
}
