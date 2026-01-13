export interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist: number;
}

export interface JointConfig {
  name: string;
  key: keyof JointAngles;
  min: number;
  max: number;
  unit: string;
}

export interface JointLimits {
  min: number;
  max: number;
}

export interface PerJointLimits {
  base: JointLimits;
  shoulder: JointLimits;
  elbow: JointLimits;
  wrist: JointLimits;
}

export interface MotionConfig {
  maxSpeed: number;      // deg/s
  maxAccel: number;      // deg/s²
}

export interface PerJointMotionConfig {
  base: MotionConfig;
  shoulder: MotionConfig;
  elbow: MotionConfig;
  wrist: MotionConfig;
}

export interface PerJointInversion {
  base: boolean;
  shoulder: boolean;
  elbow: boolean;
  wrist: boolean;
}

export interface RobotMessage {
  type: 'move';
  joints: [number, number, number, number];
}

export interface StopMessage {
  type: 'stop';
}

export interface SettingsMessage {
  type: 'settings';
  maxSpeed: number;
  acceleration: number;
  enabledJoints: {
    base: boolean;
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
  };
}

export interface RobotSettings {
  maxSpeed: number;
  acceleration: number;
  enabledJoints: {
    base: boolean;
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
  };
  jointLimits: PerJointLimits;
  motionConfig: PerJointMotionConfig;
  invertDirection: PerJointInversion;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'sent';
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type JointKey = keyof JointAngles;

export const JOINT_KEYS: JointKey[] = ['base', 'shoulder', 'elbow', 'wrist'];

export const JOINT_CONFIGS: JointConfig[] = [
  { name: 'Base Rotation', key: 'base', min: -180, max: 180, unit: '°' },
  { name: 'Shoulder Pitch', key: 'shoulder', min: -30, max: 90, unit: '°' },
  { name: 'Elbow Pitch', key: 'elbow', min: 0, max: 135, unit: '°' },
  { name: 'Wrist Rotation', key: 'wrist', min: -180, max: 180, unit: '°' },
];

export const DEFAULT_JOINT_ANGLES: JointAngles = {
  base: 0,
  shoulder: 45,
  elbow: 45,
  wrist: 0,
};

export const DEFAULT_JOINT_LIMITS: PerJointLimits = {
  base: { min: -180, max: 180 },
  shoulder: { min: -30, max: 90 },
  elbow: { min: 0, max: 135 },
  wrist: { min: -180, max: 180 },
};

export const DEFAULT_MOTION_CONFIG: PerJointMotionConfig = {
  base: { maxSpeed: 60, maxAccel: 120 },
  shoulder: { maxSpeed: 45, maxAccel: 90 },
  elbow: { maxSpeed: 60, maxAccel: 120 },
  wrist: { maxSpeed: 90, maxAccel: 180 },
};

export const DEFAULT_INVERSION: PerJointInversion = {
  base: false,
  shoulder: false,
  elbow: false,
  wrist: false,
};

export const DEFAULT_SETTINGS: RobotSettings = {
  maxSpeed: 100,
  acceleration: 50,
  enabledJoints: {
    base: true,
    shoulder: true,
    elbow: true,
    wrist: true,
  },
  jointLimits: DEFAULT_JOINT_LIMITS,
  motionConfig: DEFAULT_MOTION_CONFIG,
  invertDirection: DEFAULT_INVERSION,
};
