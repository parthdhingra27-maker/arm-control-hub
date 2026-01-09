import { Settings, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RobotSettings, JOINT_CONFIGS } from '@/types/robot';

interface SettingsPanelProps {
  settings: RobotSettings;
  onSettingsChange: (settings: RobotSettings) => void;
  onSendSettings: () => void;
  disabled?: boolean;
}

export function SettingsPanel({ settings, onSettingsChange, onSendSettings, disabled }: SettingsPanelProps) {
  const handleSpeedChange = (value: number) => {
    onSettingsChange({ ...settings, maxSpeed: value });
  };

  const handleAccelerationChange = (value: number) => {
    onSettingsChange({ ...settings, acceleration: value });
  };

  const handleJointToggle = (key: keyof RobotSettings['enabledJoints']) => {
    onSettingsChange({
      ...settings,
      enabledJoints: {
        ...settings.enabledJoints,
        [key]: !settings.enabledJoints[key],
      },
    });
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="panel-title">Settings</span>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onSendSettings}
          disabled={disabled}
          className="h-7"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Send
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* Max Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Max Speed
            </Label>
            <div className="readout">
              <span className="text-foreground">{settings.maxSpeed}</span>
              <span className="text-muted-foreground ml-1">%</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.maxSpeed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Acceleration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Acceleration
            </Label>
            <div className="readout">
              <span className="text-foreground">{settings.acceleration}</span>
              <span className="text-muted-foreground ml-1">%</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.acceleration}
            onChange={(e) => handleAccelerationChange(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Joint Enable/Disable Toggles */}
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Joint Enable/Disable
          </Label>
          <div className="space-y-3">
            {JOINT_CONFIGS.map((config) => (
              <div
                key={config.key}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <span className="text-sm text-foreground">{config.name}</span>
                <Switch
                  checked={settings.enabledJoints[config.key]}
                  onCheckedChange={() => handleJointToggle(config.key)}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Note:</span> Settings are sent to the controller.
          The ESP32 is authoritative for actual values.
        </div>
      </div>
    </div>
  );
}
