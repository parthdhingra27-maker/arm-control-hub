import { JointConfig } from '@/types/robot';

interface JointControlProps {
  config: JointConfig;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function JointControl({ config, value, onChange, disabled }: JointControlProps) {
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <label className="joint-label">{config.name}</label>
        <div className="readout">
          <span className="text-foreground">{value.toFixed(1)}</span>
          <span className="text-muted-foreground ml-1">{config.unit}</span>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-primary/30 pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={0.1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-muted-foreground font-mono">
          {config.min}{config.unit}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {config.max}{config.unit}
        </span>
      </div>
    </div>
  );
}
