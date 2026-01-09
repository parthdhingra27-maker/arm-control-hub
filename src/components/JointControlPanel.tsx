import { Settings2 } from 'lucide-react';
import { JointControl } from './JointControl';
import { JointAngles, JOINT_CONFIGS } from '@/types/robot';

interface JointControlPanelProps {
  joints: JointAngles;
  onJointChange: (key: keyof JointAngles, value: number) => void;
  disabled?: boolean;
  enabledJoints?: {
    base: boolean;
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
  };
}

export function JointControlPanel({ joints, onJointChange, disabled, enabledJoints }: JointControlPanelProps) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="panel-title">Joint Controls</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {JOINT_CONFIGS.map((config) => {
          const isJointDisabled = disabled || (enabledJoints && !enabledJoints[config.key]);
          return (
            <div key={config.key} className={enabledJoints && !enabledJoints[config.key] ? 'opacity-50' : ''}>
              <JointControl
                config={config}
                value={joints[config.key]}
                onChange={(value) => onJointChange(config.key, value)}
                disabled={isJointDisabled}
              />
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Use jog buttons for precise control or drag sliders.
          Values are sent to the robot controller at 20Hz max.
        </div>
      </div>
    </div>
  );
}
