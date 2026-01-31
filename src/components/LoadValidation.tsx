import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnergyData } from '@/hooks/useMqtt';

interface LoadValidationProps {
  data: EnergyData | null;
}

const VALID_RANGES = {
  voltage: { min: 230, max: 240, unit: 'V' },
  current: { min: 2, max: 3, unit: 'A' },
};

type ValidationStatus = 'valid' | 'invalid' | 'power_loss';

function getValidationStatus(data: EnergyData | null): {
  status: ValidationStatus;
  voltageValid: boolean;
  currentValid: boolean;
  message: string;
} {
  if (!data) {
    return {
      status: 'power_loss',
      voltageValid: false,
      currentValid: false,
      message: 'No data received',
    };
  }

  const isPowerLoss = data.voltage < 10 || data.current < 0.1;
  if (isPowerLoss) {
    return {
      status: 'power_loss',
      voltageValid: false,
      currentValid: false,
      message: 'Power Loss Detected',
    };
  }

  const voltageValid = data.voltage >= VALID_RANGES.voltage.min && data.voltage <= VALID_RANGES.voltage.max;
  const currentValid = data.current >= VALID_RANGES.current.min && data.current <= VALID_RANGES.current.max;

  if (voltageValid && currentValid) {
    return {
      status: 'valid',
      voltageValid,
      currentValid,
      message: 'Load within valid range',
    };
  }

  return {
    status: 'invalid',
    voltageValid,
    currentValid,
    message: 'Load outside valid range',
  };
}

export function LoadValidation({ data }: LoadValidationProps) {
  const validation = getValidationStatus(data);

  const statusConfig = {
    valid: {
      icon: CheckCircle,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/30',
    },
    invalid: {
      icon: AlertTriangle,
      color: 'text-[hsl(var(--warning))]',
      bg: 'bg-[hsl(var(--warning))]/10',
      border: 'border-[hsl(var(--warning))]/30',
    },
    power_loss: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
    },
  };

  const config = statusConfig[validation.status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.bg,
      config.border
    )}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={cn('h-5 w-5', config.color)} />
        <span className={cn('font-semibold', config.color)}>
          {validation.message}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Voltage Range</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-mono',
              validation.voltageValid ? 'text-accent' : 'text-destructive'
            )}>
              {data?.voltage.toFixed(1) ?? '--'} V
            </span>
            <span className="text-muted-foreground">
              ({VALID_RANGES.voltage.min}-{VALID_RANGES.voltage.max}V)
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Current Range</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-mono',
              validation.currentValid ? 'text-accent' : 'text-destructive'
            )}>
              {data?.current.toFixed(3) ?? '--'} A
            </span>
            <span className="text-muted-foreground">
              ({VALID_RANGES.current.min}-{VALID_RANGES.current.max}A)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
