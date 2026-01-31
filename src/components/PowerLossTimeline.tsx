import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { EnergyData } from '@/hooks/useMqtt';

interface PowerLossTimelineProps {
  data: EnergyData[];
}

export function PowerLossTimeline({ data }: PowerLossTimelineProps) {
  const chartData = data.map((d) => {
    const isPowerLoss = d.voltage < 10 || d.current < 0.1;
    return {
      time: new Date(d.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: isPowerLoss ? 0 : 1,
      isPowerLoss,
      power: d.power,
    };
  });

  return (
    <div className="chart-container">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Power Status Timeline
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData}>
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
            domain={[0, 1]}
            ticks={[0, 1]}
            tickFormatter={(v) => (v === 1 ? 'ON' : 'OFF')}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 18% 14%)',
              border: '1px solid hsl(220 15% 22%)',
              borderRadius: '0.5rem',
              color: 'hsl(210 20% 95%)',
            }}
            formatter={(value: number, name: string, props: any) => [
              props.payload.isPowerLoss ? 'POWER LOSS' : `${props.payload.power.toFixed(1)}W`,
              'Status'
            ]}
          />
          <Bar dataKey="status" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isPowerLoss ? 'hsl(0 75% 55%)' : 'hsl(145 80% 45%)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
