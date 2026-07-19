import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

/**
 * Accessible loading spinner with optional screen-reader label
 */
export function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('flex flex-col items-center justify-center gap-3', className)}
    >
      <div
        className={cn(
          'border-primary/30 border-t-primary rounded-full animate-spin',
          sizeMap[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      {size === 'lg' && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Skeleton loader for card placeholders
 */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-5 space-y-3"
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" aria-hidden="true" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-muted rounded animate-pulse"
          style={{ width: `${85 - i * 15}%` }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * Table/list skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-muted rounded-xl animate-pulse"
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
