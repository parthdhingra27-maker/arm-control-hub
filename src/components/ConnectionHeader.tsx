import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConnectionStatus } from '@/types/robot';

interface ConnectionHeaderProps {
  status: ConnectionStatus;
  ipAddress: string;
  latency: number | null;
  onIpChange: (ip: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionHeader({
  status,
  ipAddress,
  latency,
  onIpChange,
  onConnect,
  onDisconnect,
}: ConnectionHeaderProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const getLatencyColor = (ms: number | null) => {
    if (ms === null) return 'text-muted-foreground';
    if (ms < 50) return 'text-success';
    if (ms < 150) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <header className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="panel-title">Robot Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`status-indicator ${
                isConnected ? 'status-connected' : 'status-disconnected'
              } ${isConnecting ? 'animate-pulse-glow' : ''}`}
            />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {status}
            </span>
            {isConnected && (
              <span className={`text-xs font-mono ${getLatencyColor(latency)}`}>
                {latency !== null ? `${latency}ms` : '-- ms'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">IP:</label>
            <Input
              type="text"
              value={ipAddress}
              onChange={(e) => onIpChange(e.target.value)}
              placeholder="192.168.1.50"
              disabled={isConnected || isConnecting}
              className="w-36 h-8 font-mono text-sm bg-muted border-border"
            />
          </div>

          {isConnected ? (
            <Button
              onClick={onDisconnect}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={onConnect}
              disabled={isConnecting || !ipAddress}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
