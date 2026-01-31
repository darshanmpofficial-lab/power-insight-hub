import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { EnergyData } from '@/hooks/useMqtt';

interface EnergyChartProps {
  data: EnergyData[];
  dataKey: keyof EnergyData;
  title: string;
  unit: string;
  color: string;
  validRange?: { min: number; max: number };
}

export function EnergyChart({
  data,
  dataKey,
  title,
  unit,
  color,
  validRange,
}: EnergyChartProps) {
  const chartData = data.map((d, i) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    index: i,
  }));

  return (
    <div className="chart-container">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(210 10% 60%)"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            stroke="hsl(210 10% 60%)"
            fontSize={10}
            tickLine={false}
            domain={validRange ? [validRange.min - 20, validRange.max + 20] : ['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 18% 14%)',
              border: '1px solid hsl(220 15% 22%)',
              borderRadius: '0.5rem',
              color: 'hsl(210 20% 95%)',
            }}
            labelStyle={{ color: 'hsl(210 10% 60%)' }}
            formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
          />
          {validRange && (
            <>
              <ReferenceLine
                y={validRange.min}
                stroke="hsl(45 100% 50%)"
                strokeDasharray="5 5"
                label={{ value: `Min: ${validRange.min}`, fill: 'hsl(45 100% 50%)', fontSize: 10 }}
              />
              <ReferenceLine
                y={validRange.max}
                stroke="hsl(45 100% 50%)"
                strokeDasharray="5 5"
                label={{ value: `Max: ${validRange.max}`, fill: 'hsl(45 100% 50%)', fontSize: 10 }}
              />
            </>
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={`${color}20`}
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
