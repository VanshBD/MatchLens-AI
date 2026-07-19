import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  description,
  className,
}: StatsCardProps) {
  return (
    <article
      className={cn(
        'bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1" aria-live="polite">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'text-sm mt-1 font-medium',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
              aria-label={`Change: ${change}`}
            >
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4',
            'bg-primary/10'
          )}
          aria-hidden="true"
        >
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </article>
  );
}
