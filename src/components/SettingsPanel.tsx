import { Settings, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RobotSettings, JOINT_CONFIGS, JointKey, JointAngles } from '@/types/robot';

interface SettingsPanelProps {
  settings: RobotSettings;
  onSettingsChange: (settings: RobotSettings) => void;
  onSendSettings: () => void;
  onSetZero: (joint: JointKey) => void;
  onSendMotionConfig: (joint: JointKey, maxSpeed: number, maxAccel: number) => void;
  onSendInvert: (joint: JointKey, value: boolean) => void;
  encoderAngles: JointAngles;
  rawEncoderAngles: JointAngles;
  disabled?: boolean;
}

export function SettingsPanel({ 
  settings, 
  onSettingsChange, 
  onSendSettings,
  onSetZero,
  onSendMotionConfig,
  onSendInvert,
  encoderAngles,
  rawEncoderAngles,
  disabled 
}: SettingsPanelProps) {
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

  const handleLimitChange = (joint: JointKey, field: 'min' | 'max', value: number) => {
    onSettingsChange({
      ...settings,
      jointLimits: {
        ...settings.jointLimits,
        [joint]: {
          ...settings.jointLimits[joint],
          [field]: value,
        },
      },
    });
  };

  const handleMotionConfigChange = (joint: JointKey, field: 'maxSpeed' | 'maxAccel', value: number) => {
    const newConfig = {
      ...settings.motionConfig[joint],
      [field]: value,
    };
    onSettingsChange({
      ...settings,
      motionConfig: {
        ...settings.motionConfig,
        [joint]: newConfig,
      },
    });
  };

  const handleInvertToggle = (joint: JointKey) => {
    const newValue = !settings.invertDirection[joint];
    onSettingsChange({
      ...settings,
      invertDirection: {
        ...settings.invertDirection,
        [joint]: newValue,
      },
    });
    onSendInvert(joint, newValue);
  };

  const handleSendMotionConfig = (joint: JointKey) => {
    const config = settings.motionConfig[joint];
    onSendMotionConfig(joint, config.maxSpeed, config.maxAccel);
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
          Send Global
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* Global Max Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Global Max Speed
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

        {/* Global Acceleration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Global Acceleration
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

        {/* Per-Joint Settings */}
        <div className="space-y-4">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Per-Joint Configuration
          </Label>
          
          {JOINT_CONFIGS.map((config) => {
            const joint = config.key;
            const limits = settings.jointLimits[joint];
            const motionCfg = settings.motionConfig[joint];
            const isInverted = settings.invertDirection[joint];
            const isEnabled = settings.enabledJoints[joint];
            
            return (
              <div
                key={joint}
                className={`p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4 ${!isEnabled ? 'opacity-50' : ''}`}
              >
                {/* Joint Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{config.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Enable</span>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleJointToggle(joint)}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>

                {/* Encoder Readouts */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Logical Angle</div>
                    <div className="font-mono text-sm text-foreground">
                      {encoderAngles[joint].toFixed(1)}°
                    </div>
                  </div>
                  <div className="bg-background/50 rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Raw Encoder</div>
                    <div className="font-mono text-sm text-muted-foreground">
                      {rawEncoderAngles[joint].toFixed(1)}°
                    </div>
                  </div>
                </div>

                {/* Set Zero Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetZero(joint)}
                  disabled={disabled}
                  className="w-full h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Set Home (Zero)
                </Button>

                {/* Joint Limits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Min Limit (°)</Label>
                    <Input
                      type="number"
                      value={limits.min}
                      onChange={(e) => handleLimitChange(joint, 'min', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Max Limit (°)</Label>
                    <Input
                      type="number"
                      value={limits.max}
                      onChange={(e) => handleLimitChange(joint, 'max', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Motion Config */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Max Speed (°/s)</Label>
                    <Input
                      type="number"
                      value={motionCfg.maxSpeed}
                      onChange={(e) => handleMotionConfigChange(joint, 'maxSpeed', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Accel (°/s²)</Label>
                    <Input
                      type="number"
                      value={motionCfg.maxAccel}
                      onChange={(e) => handleMotionConfigChange(joint, 'maxAccel', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendMotionConfig(joint)}
                  disabled={disabled}
                  className="w-full h-7 text-xs"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send Motion Config
                </Button>

                {/* Invert Direction */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">Invert Direction</span>
                  <Switch
                    checked={isInverted}
                    onCheckedChange={() => handleInvertToggle(joint)}
                    disabled={disabled}
                  />
                </div>
              </div>
            );
          })}
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
