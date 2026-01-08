import { useState, useCallback, useEffect } from 'react';
import { ConnectionHeader } from './ConnectionHeader';
import { JointControlPanel } from './JointControlPanel';
import { RobotVisualization } from './RobotVisualization';
import { useRobotConnection } from '@/hooks/useRobotConnection';
import { JointAngles, DEFAULT_JOINT_ANGLES } from '@/types/robot';
import { Activity } from 'lucide-react';

export function Dashboard() {
  const [joints, setJoints] = useState<JointAngles>(DEFAULT_JOINT_ANGLES);
  const { status, ipAddress, setIpAddress, connect, disconnect, sendMessage } = useRobotConnection();

  const handleJointChange = useCallback((key: keyof JointAngles, value: number) => {
    setJoints((prev) => {
      const newJoints = { ...prev, [key]: value };
      return newJoints;
    });
  }, []);

  // Send joint updates when connected
  useEffect(() => {
    if (status === 'connected') {
      sendMessage(joints);
    }
  }, [joints, status, sendMessage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">4-DOF Robot Arm</h1>
              <p className="text-xs text-muted-foreground">Control Dashboard</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Protocol:</span>
              <span className="font-mono text-foreground">WebSocket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Rate:</span>
              <span className="font-mono text-foreground">20 Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Header */}
      <div className="container mx-auto px-4 py-4">
        <ConnectionHeader
          status={status}
          ipAddress={ipAddress}
          onIpChange={setIpAddress}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Joint Controls */}
          <JointControlPanel
            joints={joints}
            onJointChange={handleJointChange}
            disabled={status !== 'connected'}
          />

          {/* 3D Visualization */}
          <RobotVisualization joints={joints} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Robot controller authority: ESP32</span>
          <span>Frontend visualization only — no motion planning</span>
        </div>
      </footer>
    </div>
  );
}
