import { useState } from 'react';
import { Lightbulb, Plug, Plus, Check, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnergyData } from '@/hooks/useMqtt';

interface Appliance {
  id: string;
  name: string;
  type: 'bulb' | 'fan' | 'ac' | 'heater';
  icon: typeof Lightbulb;
  ratedPower: number; // watts
  ratedVoltage: number;
  isConnected: boolean;
}

const APPLIANCE_PRESETS: Omit<Appliance, 'id' | 'isConnected'>[] = [
  { name: 'LED Bulb (9W)', type: 'bulb', icon: Lightbulb, ratedPower: 9, ratedVoltage: 230 },
  { name: 'CFL Bulb (15W)', type: 'bulb', icon: Lightbulb, ratedPower: 15, ratedVoltage: 230 },
  { name: 'Incandescent (60W)', type: 'bulb', icon: Lightbulb, ratedPower: 60, ratedVoltage: 230 },
  { name: 'LED Bulb (12W)', type: 'bulb', icon: Lightbulb, ratedPower: 12, ratedVoltage: 230 },
];

interface ApplianceConnectionProps {
  currentData: EnergyData | null;
  isSystemOn: boolean;
}

export function ApplianceConnection({ currentData, isSystemOn }: ApplianceConnectionProps) {
  const [appliances, setAppliances] = useState<Appliance[]>([
    {
      id: '1',
      name: 'LED Bulb (9W)',
      type: 'bulb',
      icon: Lightbulb,
      ratedPower: 9,
      ratedVoltage: 230,
      isConnected: true,
    },
  ]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const connectedAppliance = appliances.find((a) => a.isConnected);

  const addAppliance = () => {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === selectedPreset);
    if (preset) {
      const newAppliance: Appliance = {
        ...preset,
        id: Date.now().toString(),
        isConnected: false,
      };
      setAppliances((prev) => prev.map((a) => ({ ...a, isConnected: false })));
      setAppliances((prev) => [...prev, { ...newAppliance, isConnected: true }]);
      setSelectedPreset('');
    }
  };

  const connectAppliance = (id: string) => {
    setAppliances((prev) =>
      prev.map((a) => ({ ...a, isConnected: a.id === id }))
    );
  };

  // Calculate efficiency based on connected appliance
  const calculateEfficiency = () => {
    if (!connectedAppliance || !currentData) return null;
    const expectedCurrent = connectedAppliance.ratedPower / connectedAppliance.ratedVoltage;
    const actualPower = currentData.power;
    const efficiency = Math.min(100, (connectedAppliance.ratedPower / actualPower) * 100);
    return {
      expectedCurrent: expectedCurrent.toFixed(3),
      actualCurrent: currentData.current.toFixed(3),
      efficiency: efficiency.toFixed(1),
      powerLoss: currentData.currentLoss.toFixed(2),
    };
  };

  const efficiency = calculateEfficiency();

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" />
          Appliance Connection
        </h3>
        <div className="flex items-center gap-2">
          <Select value={selectedPreset} onValueChange={setSelectedPreset}>
            <SelectTrigger className="w-[180px] h-8 text-sm">
              <SelectValue placeholder="Add appliance..." />
            </SelectTrigger>
            <SelectContent>
              {APPLIANCE_PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={addAppliance}
            disabled={!selectedPreset}
            className="h-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Connected Appliance Visual */}
      {connectedAppliance && (
        <div className="flex flex-col items-center mb-5">
          <div
            className={cn(
              'relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
              isSystemOn && currentData
                ? 'bg-warning/20 border-2 border-warning'
                : 'bg-muted border-2 border-border'
            )}
          >
            <Lightbulb
              className={cn(
                'h-12 w-12 transition-all duration-300',
                isSystemOn && currentData
                  ? 'text-warning fill-warning/30'
                  : 'text-muted-foreground'
              )}
            />
            {isSystemOn && currentData && (
              <div className="absolute inset-0 rounded-full bg-warning/10 animate-pulse" />
            )}
          </div>
          <p className="mt-3 font-medium text-foreground">{connectedAppliance.name}</p>
          <p className="text-xs text-muted-foreground">
            Rated: {connectedAppliance.ratedPower}W @ {connectedAppliance.ratedVoltage}V
          </p>
        </div>
      )}

      {/* Live Metrics */}
      {efficiency && currentData && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-secondary/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Expected Current</p>
            <p className="font-mono text-lg text-foreground">{efficiency.expectedCurrent}A</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Actual Current</p>
            <p className="font-mono text-lg text-foreground">{efficiency.actualCurrent}A</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
            <p className={cn(
              'font-mono text-lg',
              parseFloat(efficiency.efficiency) > 90 ? 'text-accent' : 'text-warning'
            )}>
              {efficiency.efficiency}%
            </p>
          </div>
          <div className="bg-secondary/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Power Loss</p>
            <p className="font-mono text-lg text-destructive">{efficiency.powerLoss}W</p>
          </div>
        </div>
      )}

      {/* Appliance List */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Available Appliances
        </p>
        {appliances.map((appliance) => (
          <div
            key={appliance.id}
            className={cn(
              'flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer',
              appliance.isConnected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            )}
            onClick={() => connectAppliance(appliance.id)}
          >
            <div className="flex items-center gap-2">
              <appliance.icon className={cn(
                'h-4 w-4',
                appliance.isConnected ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className="text-sm text-foreground">{appliance.name}</span>
            </div>
            {appliance.isConnected ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Power className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
