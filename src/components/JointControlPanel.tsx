import { Settings2 } from 'lucide-react';
import { JointControl } from './JointControl';
import { JointAngles, JOINT_CONFIGS, PerJointLimits, JointKey } from '@/types/robot';

interface JointControlPanelProps {
  targetJoints: JointAngles;
  encoderAngles: JointAngles;
  jointLimits: PerJointLimits;
  onJointChange: (key: keyof JointAngles, value: number) => void;
  disabled?: boolean;
  enabledJoints?: {
    base: boolean;
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
  };
  isMoving?: boolean;
}

export function JointControlPanel({ 
  targetJoints, 
  encoderAngles,
  jointLimits,
  onJointChange, 
  disabled, 
  enabledJoints,
  isMoving
}: JointControlPanelProps) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="panel-title">Joint Controls</span>
        </div>
        {isMoving && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-warning">Moving</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {JOINT_CONFIGS.map((config) => {
          const joint = config.key as JointKey;
          const isJointDisabled = disabled || (enabledJoints && !enabledJoints[joint]);
          const limits = jointLimits[joint];
          const encoderValue = encoderAngles[joint];
          const targetValue = targetJoints[joint];
          
          // Check if at limits
          const atMinLimit = encoderValue <= limits.min + 0.5;
          const atMaxLimit = encoderValue >= limits.max - 0.5;
          
          return (
            <div key={joint} className={enabledJoints && !enabledJoints[joint] ? 'opacity-50' : ''}>
              <JointControl
                config={{
                  ...config,
                  min: limits.min,
                  max: limits.max,
                }}
                targetValue={targetValue}
                encoderValue={encoderValue}
                onChange={(value) => onJointChange(joint, value)}
                disabled={isJointDisabled}
                atMinLimit={atMinLimit}
                atMaxLimit={atMaxLimit}
              />
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Sliders set target position. Readouts show actual encoder position.
          Joint limits and controls configured in Settings tab.
        </div>
      </div>
    </div>
  );
}
