import { useState, useRef, useCallback, useEffect } from 'react';
import { ConnectionStatus, JointAngles, RobotMessage, RobotSettings, LogEntry } from '@/types/robot';

const THROTTLE_MS = 50;

export function useRobotConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [ipAddress, setIpAddress] = useState('192.168.1.50');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStopped, setIsStopped] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSendRef = useRef<number>(0);
  const pendingMessageRef = useRef<RobotMessage | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimestampRef = useRef<number>(0);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      message,
      type,
    };
    setLogs((prev) => [...prev.slice(-99), entry]);
  }, []);

  const sendMessage = useCallback((joints: JointAngles) => {
    if (isStopped) return;

    const message: RobotMessage = {
      joints: [joints.base, joints.shoulder, joints.elbow, joints.wrist],
    };

    const now = Date.now();
    const timeSinceLastSend = now - lastSendRef.current;

    if (timeSinceLastSend >= THROTTLE_MS) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        lastSendRef.current = now;
      }
    } else {
      pendingMessageRef.current = message;
      
      if (!throttleTimeoutRef.current) {
        throttleTimeoutRef.current = setTimeout(() => {
          if (pendingMessageRef.current && wsRef.current?.readyState === WebSocket.OPEN && !isStopped) {
            wsRef.current.send(JSON.stringify(pendingMessageRef.current));
            lastSendRef.current = Date.now();
            pendingMessageRef.current = null;
          }
          throttleTimeoutRef.current = null;
        }, THROTTLE_MS - timeSinceLastSend);
      }
    }
  }, [isStopped]);

  const sendStop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const stopMessage = { type: 'stop' };
      wsRef.current.send(JSON.stringify(stopMessage));
      addLog('Emergency stop sent', 'warning');
      setIsStopped(true);
    }
  }, [addLog]);

  const resetStop = useCallback(() => {
    setIsStopped(false);
    addLog('Controls resumed', 'info');
  }, [addLog]);

  const sendSettings = useCallback((settings: RobotSettings) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const settingsMessage = {
        type: 'settings',
        maxSpeed: settings.maxSpeed,
        acceleration: settings.acceleration,
        enabledJoints: settings.enabledJoints,
      };
      wsRef.current.send(JSON.stringify(settingsMessage));
      addLog(`Settings updated: speed=${settings.maxSpeed}, accel=${settings.acceleration}`, 'sent');
    }
  }, [addLog]);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    addLog(`Connecting to ${ipAddress}:81...`, 'info');

    try {
      const ws = new WebSocket(`ws://${ipAddress}:81`);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setIsStopped(false);
        addLog('Connected successfully', 'info');
        
        // Start ping interval for latency measurement
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            pingTimestampRef.current = Date.now();
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 2000);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        setLatency(null);
        wsRef.current = null;
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        addLog('Connection closed', 'warning');
      };

      ws.onerror = () => {
        setStatus('disconnected');
        setLatency(null);
        wsRef.current = null;
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        addLog('Connection error', 'error');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            const rtt = Date.now() - pingTimestampRef.current;
            setLatency(rtt);
          } else if (data.joints && Array.isArray(data.joints)) {
            addLog(`Feedback: [${data.joints.join(', ')}]`, 'info');
          } else if (data.log) {
            addLog(data.log, data.level || 'info');
          } else {
            addLog(`Received: ${event.data}`, 'info');
          }
        } catch (e) {
          addLog(`Raw message: ${event.data}`, 'info');
        }
      };
    } catch (error) {
      setStatus('disconnected');
      addLog(`Connection failed: ${error}`, 'error');
    }
  }, [ipAddress, addLog]);

  const disconnect = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
    setLatency(null);
    addLog('Disconnected', 'info');
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    status,
    ipAddress,
    setIpAddress,
    connect,
    disconnect,
    sendMessage,
    sendStop,
    resetStop,
    sendSettings,
    logs,
    clearLogs,
    isStopped,
    latency,
  };
}
