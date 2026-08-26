'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  className,
  disabled = false,
}: QuantitySelectorProps) {
  const decrement = useCallback(() => {
    if (value > min) onChange(value - 1);
  }, [value, min, onChange]);

  const increment = useCallback(() => {
    if (value < max) onChange(value + 1);
  }, [value, max, onChange]);

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border bg-background overflow-hidden',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none border-r hover:bg-muted"
        onClick={decrement}
        disabled={value <= min || disabled}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-12 text-center text-base font-semibold tabular-nums select-none">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none border-l hover:bg-muted"
        onClick={increment}
        disabled={value >= max || disabled}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
