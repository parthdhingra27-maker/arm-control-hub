import { useState, useCallback, useEffect, useRef } from 'react';
import { ConnectionHeader } from './ConnectionHeader';
import { JointControlPanel } from './JointControlPanel';
import { RobotVisualization } from './RobotVisualization';
import { EmergencyStop } from './EmergencyStop';
import { SettingsPanel } from './SettingsPanel';
import { LoggingPanel } from './LoggingPanel';
import { useRobotConnection } from '@/hooks/useRobotConnection';
import { JointAngles, DEFAULT_JOINT_ANGLES, RobotSettings, DEFAULT_SETTINGS, JointKey } from '@/types/robot';
import { Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
  // Target angles (slider state)
  const [targetJoints, setTargetJoints] = useState<JointAngles>(DEFAULT_JOINT_ANGLES);
  const [settings, setSettings] = useState<RobotSettings>(DEFAULT_SETTINGS);
  
  // Track user interaction to prevent encoder feedback from updating sliders during interaction
  const isUserInteractingRef = useRef(false);
  
  const {
    status,
    ipAddress,
    setIpAddress,
    connect,
    disconnect,
    sendMessage,
    sendStop,
    resetStop,
    sendSettings,
    sendSetZero,
    sendMotionConfig,
    sendInvertDirection,
    logs,
    clearLogs,
    isStopped,
    latency,
    encoderAngles,
    rawEncoderAngles,
    motionState,
  } = useRobotConnection();

  // Clamp value to joint limits
  const clampToLimits = useCallback((key: JointKey, value: number): number => {
    const limits = settings.jointLimits[key];
    return Math.max(limits.min, Math.min(limits.max, value));
  }, [settings.jointLimits]);

  const handleJointChange = useCallback((key: keyof JointAngles, value: number) => {
    if (!settings.enabledJoints[key]) return;
    
    const clampedValue = clampToLimits(key, value);
    setTargetJoints((prev) => ({ ...prev, [key]: clampedValue }));
  }, [settings.enabledJoints, clampToLimits]);

  // Track when user starts/stops interacting with controls
  const handleInteractionStart = useCallback(() => {
    isUserInteractingRef.current = true;
  }, []);

  const handleInteractionEnd = useCallback(() => {
    isUserInteractingRef.current = false;
  }, []);

  const handleSendSettings = useCallback(() => {
    sendSettings(settings);
  }, [settings, sendSettings]);

  // Send joint updates when connected
  useEffect(() => {
    if (status === 'connected' && !isStopped) {
      sendMessage(targetJoints);
    }
  }, [targetJoints, status, sendMessage, isStopped]);

  // Sync sliders to encoder only when motion stops AND user is not interacting
  useEffect(() => {
    if (motionState.targetReached && !motionState.isMoving && !isUserInteractingRef.current) {
      // Only sync if there's a significant difference (prevents jitter)
      const threshold = 0.5;
      const needsSync = (Object.keys(encoderAngles) as JointKey[]).some(
        (key) => Math.abs(targetJoints[key] - encoderAngles[key]) > threshold
      );
      
      if (needsSync) {
        setTargetJoints(encoderAngles);
      }
    }
  }, [motionState.targetReached, motionState.isMoving, encoderAngles, targetJoints]);

  const isControlDisabled = status !== 'connected' || isStopped;

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
          <div className="flex items-center gap-4">
            <EmergencyStop
              isStopped={isStopped}
              onStop={sendStop}
              onReset={resetStop}
              disabled={status !== 'connected'}
            />
            <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Protocol:</span>
                <span className="font-mono text-foreground">WebSocket</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wide">Rate:</span>
                <span className="font-mono text-foreground">20 Hz</span>
              </div>
              {motionState.isMoving && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                  <span className="text-warning">Moving</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Header */}
      <div className="container mx-auto px-4 py-4">
        <ConnectionHeader
          status={status}
          ipAddress={ipAddress}
          latency={latency}
          onIpChange={setIpAddress}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>

      {/* Stopped Banner */}
      {isStopped && (
        <div className="container mx-auto px-4 pb-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center justify-center gap-2">
            <span className="text-destructive font-semibold uppercase tracking-wider text-sm">
              ⚠ Emergency Stop Active — Controls Disabled
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-6 overflow-hidden">
        <Tabs defaultValue="control" className="h-full flex flex-col">
          <TabsList className="mb-4 flex-shrink-0">
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="flex-1 overflow-hidden">
            <div className="flex flex-col gap-4 h-full">
              {/* Main panels - Joint Controls and 3D Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Joint Controls - shows target angles (sliders) and encoder angles (readouts) */}
                <JointControlPanel
                  targetJoints={targetJoints}
                  encoderAngles={encoderAngles}
                  jointLimits={settings.jointLimits}
                  onJointChange={handleJointChange}
                  onInteractionStart={handleInteractionStart}
                  onInteractionEnd={handleInteractionEnd}
                  disabled={isControlDisabled}
                  enabledJoints={settings.enabledJoints}
                  isMoving={motionState.isMoving}
                />

                {/* 3D Visualization - driven by encoder angles (actual position) */}
                <RobotVisualization joints={encoderAngles} />
              </div>

              {/* Logging Panel - smaller */}
              <div className="h-32 flex-shrink-0">
                <LoggingPanel logs={logs} onClear={clearLogs} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onSendSettings={handleSendSettings}
                onSetZero={sendSetZero}
                onSendMotionConfig={sendMotionConfig}
                onSendInvert={sendInvertDirection}
                encoderAngles={encoderAngles}
                rawEncoderAngles={rawEncoderAngles}
                disabled={status !== 'connected'}
              />
              <LoggingPanel logs={logs} onClear={clearLogs} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Robot controller authority: ESP32</span>
          <span>Developed by Parth Dhingra</span>
          <span>Frontend visualization only — no motion planning</span>
        </div>
      </footer>
    </div>
  );
}
