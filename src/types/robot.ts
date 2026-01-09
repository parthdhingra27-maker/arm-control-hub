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

export interface RobotMessage {
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
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'sent';
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

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

export const DEFAULT_SETTINGS: RobotSettings = {
  maxSpeed: 100,
  acceleration: 50,
  enabledJoints: {
    base: true,
    shoulder: true,
    elbow: true,
    wrist: true,
  },
};
