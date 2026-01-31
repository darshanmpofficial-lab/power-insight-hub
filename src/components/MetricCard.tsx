import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'danger' | 'success';
  subtitle?: string;
  className?: string;
}

const statusColors = {
  normal: 'text-primary',
  warning: 'text-[hsl(var(--warning))]',
  danger: 'text-destructive',
  success: 'text-accent',
};

const statusGlows = {
  normal: 'text-glow-primary',
  warning: 'text-glow-warning',
  danger: '',
  success: 'text-glow-accent',
};

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  status = 'normal',
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <div className={cn('metric-card group', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="metric-label">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className={cn('metric-value data-flow', statusColors[status], statusGlows[status])}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-2 transition-colors',
          'bg-secondary group-hover:bg-primary/20'
        )}>
          <Icon className={cn('h-5 w-5', statusColors[status])} />
        </div>
      </div>
    </div>
  );
}
