import { Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface PowerSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function PowerSwitch({ isOn, onToggle, disabled }: PowerSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2 transition-all',
        isOn 
          ? 'border-accent bg-accent/10' 
          : 'border-destructive bg-destructive/10'
      )}>
        <Power className={cn(
          'h-5 w-5 transition-colors',
          isOn ? 'text-accent' : 'text-destructive'
        )} />
        <span className={cn(
          'font-mono text-sm font-bold',
          isOn ? 'text-accent' : 'text-destructive'
        )}>
          {isOn ? 'SYSTEM ON' : 'SYSTEM OFF'}
        </span>
      </div>
      <Switch
        checked={isOn}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-destructive"
      />
    </div>
  );
}
