'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && (onAction || actionHref) && (
        actionHref ? (
          <a href={actionHref}>
            <Button variant="default" size="sm">
              {actionLabel}
            </Button>
          </a>
        ) : (
          <Button variant="default" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
