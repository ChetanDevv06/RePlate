import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/constants';
import { calculateDiscountPercentage } from '@/lib/calculations';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

export function PriceDisplay({
  originalPrice,
  discountedPrice,
  size = 'md',
  className,
  showBadge = true,
}: PriceDisplayProps) {
  const discount = calculateDiscountPercentage(originalPrice, discountedPrice);

  const sizeClasses = {
    sm: { discounted: 'text-base font-bold', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { discounted: 'text-xl font-bold', original: 'text-sm', badge: 'text-xs px-2 py-0.5' },
    lg: { discounted: 'text-2xl font-bold', original: 'text-base', badge: 'text-xs px-2 py-1' },
  }[size];

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('text-primary', sizeClasses.discounted)}>
        {formatCurrency(discountedPrice)}
      </span>
      <span className={cn('text-muted-foreground line-through', sizeClasses.original)}>
        {formatCurrency(originalPrice)}
      </span>
      {showBadge && discount > 0 && (
        <span className={cn('discount-badge rounded', sizeClasses.badge)}>
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
