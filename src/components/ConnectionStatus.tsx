import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
}

export function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
        isConnected ? 'status-online' : 'status-offline'
      )}>
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Disconnected</span>
          </>
        )}
      </div>
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}
    </div>
  );
}
