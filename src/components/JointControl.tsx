import { useState, useEffect, useRef } from 'react';
import { JointConfig } from '@/types/robot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, AlertTriangle } from 'lucide-react';

interface JointControlProps {
  config: JointConfig;
  targetValue: number;
  encoderValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  atMinLimit?: boolean;
  atMaxLimit?: boolean;
}

const JOG_AMOUNTS = [-10, -1, 1, 10];

export function JointControl({ 
  config, 
  targetValue, 
  encoderValue, 
  onChange, 
  disabled,
  atMinLimit,
  atMaxLimit 
}: JointControlProps) {
  const [inputValue, setInputValue] = useState(targetValue.toFixed(1));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Calculate percentages for visual bars
  const targetPercentage = ((targetValue - config.min) / (config.max - config.min)) * 100;
  const encoderPercentage = ((encoderValue - config.min) / (config.max - config.min)) * 100;

  // Sync input when targetValue changes externally (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(targetValue.toFixed(1));
    }
  }, [targetValue, isEditing]);

  const handleJog = (amount: number) => {
    // Respect limits when jogging
    if (amount < 0 && atMinLimit) return;
    if (amount > 0 && atMaxLimit) return;
    
    const newValue = Math.max(config.min, Math.min(config.max, targetValue + amount));
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
      setInputValue(targetValue.toFixed(1));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(targetValue.toFixed(1));
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    inputRef.current?.select();
  };

  const showLimitWarning = atMinLimit || atMaxLimit;

  return (
    <div className={`p-4 bg-muted/30 rounded-lg border animate-fade-in ${showLimitWarning ? 'border-warning/50' : 'border-border/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="joint-label">{config.name}</label>
          {showLimitWarning && (
            <div className="flex items-center gap-1 text-warning">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs">{atMinLimit ? 'MIN' : 'MAX'}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Encoder readout (actual position) */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Actual</div>
            <div className="font-mono text-sm text-foreground">
              {encoderValue.toFixed(1)}{config.unit}
            </div>
          </div>
          {/* Target input */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Target</div>
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
        </div>
      </div>

      {/* Jog Buttons */}
      <div className="flex items-center gap-1 mb-3">
        {JOG_AMOUNTS.map((amount) => {
          const isDisabled = disabled || 
            (amount < 0 && atMinLimit) || 
            (amount > 0 && atMaxLimit);
          
          return (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handleJog(amount)}
              disabled={isDisabled}
              className="flex-1 h-8 text-xs font-mono"
            >
              {amount > 0 ? <Plus className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
              {Math.abs(amount)}°
            </Button>
          );
        })}
      </div>

      <div className="relative">
        {/* Encoder position indicator (actual) */}
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-success/40 pointer-events-none transition-all duration-100"
          style={{ width: `${Math.max(0, Math.min(100, encoderPercentage))}%` }}
        />
        {/* Target position indicator */}
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-primary/60 pointer-events-none"
          style={{ width: `${Math.max(0, Math.min(100, targetPercentage))}%` }}
        />
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={0.1}
          value={targetValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className={`text-xs font-mono ${atMinLimit ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
          {config.min}{config.unit}
        </span>
        <span className={`text-xs font-mono ${atMaxLimit ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
          {config.max}{config.unit}
        </span>
      </div>
    </div>
  );
}
