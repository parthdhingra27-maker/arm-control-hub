import { OctagonX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyStopProps {
  isStopped: boolean;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function EmergencyStop({ isStopped, onStop, onReset, disabled }: EmergencyStopProps) {
  return (
    <div className="flex items-center gap-2">
      {!isStopped ? (
        <Button
          variant="destructive"
          size="lg"
          onClick={onStop}
          disabled={disabled}
          className="h-12 px-6 font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-shadow"
        >
          <OctagonX className="w-5 h-5 mr-2" />
          Emergency Stop
        </Button>
      ) : (
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="h-12 px-6 font-bold uppercase tracking-wider border-warning text-warning hover:bg-warning hover:text-warning-foreground"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset / Resume
        </Button>
      )}
    </div>
  );
}
