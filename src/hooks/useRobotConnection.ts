import { useState, useRef, useCallback, useEffect } from 'react';
import { ConnectionStatus, JointAngles, RobotMessage } from '@/types/robot';

const THROTTLE_MS = 50;

export function useRobotConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [ipAddress, setIpAddress] = useState('192.168.1.50');
  const wsRef = useRef<WebSocket | null>(null);
  const lastSendRef = useRef<number>(0);
  const pendingMessageRef = useRef<RobotMessage | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback((joints: JointAngles) => {
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
          if (pendingMessageRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(pendingMessageRef.current));
            lastSendRef.current = Date.now();
            pendingMessageRef.current = null;
          }
          throttleTimeoutRef.current = null;
        }, THROTTLE_MS - timeSinceLastSend);
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(`ws://${ipAddress}:81`);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;
      };

      ws.onerror = () => {
        setStatus('disconnected');
        wsRef.current = null;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle feedback from robot controller
          if (data.joints && Array.isArray(data.joints)) {
            // Feedback handling would update state here
            console.log('Received feedback:', data);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
    } catch (error) {
      setStatus('disconnected');
      console.error('Connection error:', error);
    }
  }, [ipAddress]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
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
  };
}
