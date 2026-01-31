import { AlertOctagon, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnergyData } from '@/hooks/useMqtt';

interface AnomalyDetectionProps {
  data: EnergyData[];
  currentData: EnergyData | null;
}

type AnomalyLabel = 'NORMAL' | 'ABNORMAL' | 'POWER_LOSS';

function calculateZScore(value: number, data: number[]): number {
  if (data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = Math.sqrt(
    data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length
  );
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

function detectAnomaly(current: EnergyData | null, history: EnergyData[]): {
  label: AnomalyLabel;
  zScores: { voltage: number; current: number; power: number };
  confidence: number;
} {
  if (!current) {
    return {
      label: 'POWER_LOSS',
      zScores: { voltage: 0, current: 0, power: 0 },
      confidence: 100,
    };
  }

  // Check for power loss first
  if (current.voltage < 10 || current.current < 0.1) {
    return {
      label: 'POWER_LOSS',
      zScores: { voltage: 0, current: 0, power: 0 },
      confidence: 100,
    };
  }

  const voltageHistory = history.map((d) => d.voltage);
  const currentHistory = history.map((d) => d.current);
  const powerHistory = history.map((d) => d.power);

  const zScores = {
    voltage: calculateZScore(current.voltage, voltageHistory),
    current: calculateZScore(current.current, currentHistory),
    power: calculateZScore(current.power, powerHistory),
  };

  // Anomaly if any z-score exceeds threshold (±2.5)
  const threshold = 2.5;
  const maxZ = Math.max(
    Math.abs(zScores.voltage),
    Math.abs(zScores.current),
    Math.abs(zScores.power)
  );

  if (maxZ > threshold) {
    return {
      label: 'ABNORMAL',
      zScores,
      confidence: Math.min(100, (maxZ / threshold) * 50 + 50),
    };
  }

  return {
    label: 'NORMAL',
    zScores,
    confidence: Math.max(0, 100 - (maxZ / threshold) * 50),
  };
}

export function AnomalyDetection({ data, currentData }: AnomalyDetectionProps) {
  const analysis = detectAnomaly(currentData, data);

  const labelConfig = {
    NORMAL: {
      icon: Activity,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      label: 'Normal Operation',
    },
    ABNORMAL: {
      icon: AlertOctagon,
      color: 'text-[hsl(var(--warning))]',
      bg: 'bg-[hsl(var(--warning))]/10',
      border: 'border-[hsl(var(--warning))]/30',
      label: 'Anomaly Detected',
    },
    POWER_LOSS: {
      icon: Zap,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      label: 'Power Loss',
    },
  };

  const config = labelConfig[analysis.label];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.bg,
      config.border
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', config.color)} />
          <span className={cn('font-semibold', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className={cn('font-mono text-lg', config.color)}>
            {analysis.confidence.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {(['voltage', 'current', 'power'] as const).map((key) => (
          <div key={key} className="text-center">
            <p className="text-xs text-muted-foreground uppercase">{key}</p>
            <p className={cn(
              'font-mono text-sm',
              Math.abs(analysis.zScores[key]) > 2.5 ? 'text-[hsl(var(--warning))]' : 'text-foreground'
            )}>
              z={analysis.zScores[key].toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
