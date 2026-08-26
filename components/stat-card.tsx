'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  colorVariant?: 'green' | 'blue' | 'amber' | 'emerald';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorVariant = 'green',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-200 hover:shadow-md',
        `stat-card-${colorVariant}`,
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="size-8 rounded-lg bg-white/60 flex items-center justify-center">
            <Icon className="size-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
