import { useState, useEffect, useRef } from 'react';
import { JointConfig } from '@/types/robot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface JointControlProps {
  config: JointConfig;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const JOG_AMOUNTS = [-10, -1, 1, 10];

export function JointControl({ config, value, onChange, disabled }: JointControlProps) {
  const [inputValue, setInputValue] = useState(value.toFixed(1));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const percentage = ((value - config.min) / (config.max - config.min)) * 100;

  // Sync input when value changes externally (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toFixed(1));
    }
  }, [value, isEditing]);

  const handleJog = (amount: number) => {
    const newValue = Math.max(config.min, Math.min(config.max, value + amount));
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(config.min, Math.min(config.max, parsed));
      onChange(clamped);
      setInputValue(clamped.toFixed(1));
    } else {
      setInputValue(value.toFixed(1));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toFixed(1));
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    inputRef.current?.select();
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <label className="joint-label">{config.name}</label>
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            disabled={disabled}
            className="w-20 h-7 text-right font-mono text-sm px-2 py-0"
          />
          <span className="text-muted-foreground text-sm">{config.unit}</span>
        </div>
      </div>

      {/* Jog Buttons */}
      <div className="flex items-center gap-1 mb-3">
        {JOG_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => handleJog(amount)}
            disabled={disabled}
            className="flex-1 h-8 text-xs font-mono"
          >
            {amount > 0 ? <Plus className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
            {Math.abs(amount)}°
          </Button>
        ))}
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
