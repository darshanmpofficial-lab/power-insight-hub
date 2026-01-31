import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  currentLoss: number;
  monthlyPower: number;
  timestamp: number;
}

interface UseMqttReturn {
  isConnected: boolean;
  isSystemOn: boolean;
  currentData: EnergyData | null;
  dataHistory: EnergyData[];
  toggleSystem: () => void;
  connectionError: string | null;
}

const MQTT_BROKER = 'ws://10.73.18.34:9001'; // WebSocket port for MQTT
const TOPIC_REALTIME = 'home/energy/realtime';
const TOPIC_CONTROL = 'home/energy/control';
const MAX_HISTORY = 60; // Keep last 60 readings (5 min at 5s intervals)

export function useMqtt(): UseMqttReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isSystemOn, setIsSystemOn] = useState(true);
  const [currentData, setCurrentData] = useState<EnergyData | null>(null);
  const [dataHistory, setDataHistory] = useState<EnergyData[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      clientId: `energy-dashboard-${Math.random().toString(16).slice(2, 8)}`,
    });

    clientRef.current = client;

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);
      setConnectionError(null);
      client.subscribe(TOPIC_REALTIME, (err) => {
        if (err) {
          console.error('Subscribe error:', err);
          setConnectionError('Failed to subscribe to energy topic');
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === TOPIC_REALTIME) {
        try {
          const data: EnergyData = JSON.parse(message.toString());
          data.timestamp = Date.now();
          setCurrentData(data);
          setDataHistory((prev) => {
            const newHistory = [...prev, data];
            return newHistory.slice(-MAX_HISTORY);
          });
        } catch (err) {
          console.error('Failed to parse MQTT message:', err);
        }
      }
    });

    client.on('error', (err) => {
      console.error('MQTT error:', err);
      setConnectionError(`Connection error: ${err.message}`);
    });

    client.on('close', () => {
      setIsConnected(false);
    });

    client.on('offline', () => {
      setIsConnected(false);
      setConnectionError('Connection lost - attempting to reconnect...');
    });

    return () => {
      client.end();
    };
  }, []);

  const toggleSystem = useCallback(() => {
    if (clientRef.current && isConnected) {
      const newState = !isSystemOn;
      clientRef.current.publish(
        TOPIC_CONTROL,
        JSON.stringify({ power: newState ? 'ON' : 'OFF' }),
        { qos: 1 }
      );
      setIsSystemOn(newState);
    }
  }, [isConnected, isSystemOn]);

  return {
    isConnected,
    isSystemOn,
    currentData,
    dataHistory,
    toggleSystem,
    connectionError,
  };
}
