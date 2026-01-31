import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { EnergyData } from '@/hooks/useMqtt';

interface DailyEnergySummaryProps {
  data: EnergyData[];
}

export function DailyEnergySummary({ data }: DailyEnergySummaryProps) {
  // Calculate energy consumed and lost from the data
  const intervalHours = 5 / 3600; // 5 seconds in hours
  
  let totalConsumed = 0;
  let totalLost = 0;
  
  data.forEach((d) => {
    totalConsumed += d.power * intervalHours; // Wh
    totalLost += d.currentLoss * intervalHours; // Wh
  });

  const chartData = [
    {
      name: 'Today',
      consumed: parseFloat(totalConsumed.toFixed(2)),
      lost: parseFloat(totalLost.toFixed(2)),
    },
  ];

  return (
    <div className="chart-container">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Session Energy Summary
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-secondary p-3">
          <p className="text-xs text-muted-foreground uppercase">Energy Consumed</p>
          <p className="font-mono text-xl text-primary">
            {totalConsumed.toFixed(2)} <span className="text-sm">Wh</span>
          </p>
        </div>
        <div className="rounded-lg bg-secondary p-3">
          <p className="text-xs text-muted-foreground uppercase">Energy Lost</p>
          <p className="font-mono text-xl text-destructive">
            {totalLost.toFixed(2)} <span className="text-sm">Wh</span>
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
          <XAxis type="number" stroke="hsl(210 10% 60%)" fontSize={10} />
          <YAxis type="category" dataKey="name" stroke="hsl(210 10% 60%)" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 18% 14%)',
              border: '1px solid hsl(220 15% 22%)',
              borderRadius: '0.5rem',
              color: 'hsl(210 20% 95%)',
            }}
          />
          <Legend />
          <Bar dataKey="consumed" fill="hsl(195 100% 50%)" name="Consumed (Wh)" />
          <Bar dataKey="lost" fill="hsl(0 75% 55%)" name="Lost (Wh)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
