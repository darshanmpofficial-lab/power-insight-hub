import { useState, useEffect, useCallback } from 'react';
import { EnergyData } from './useMqtt';

const MAX_HISTORY = 60;

// Simulated data for demo/development when MQTT is not available
export function useSimulatedData() {
  const [isSystemOn, setIsSystemOn] = useState(true);
  const [currentData, setCurrentData] = useState<EnergyData | null>(null);
  const [dataHistory, setDataHistory] = useState<EnergyData[]>([]);

  useEffect(() => {
    const generateData = (): EnergyData => {
      // Simulate power loss occasionally (5% chance)
      const isPowerLoss = Math.random() < 0.05;
      
      // Normal operating ranges with some variation
      const baseVoltage = isPowerLoss ? Math.random() * 5 : 230 + (Math.random() - 0.5) * 20;
      const baseCurrent = isPowerLoss ? Math.random() * 0.05 : 2.5 + (Math.random() - 0.5) * 1.5;
      
      // Add occasional invalid load conditions (10% chance when not power loss)
      const isInvalidLoad = !isPowerLoss && Math.random() < 0.1;
      const voltage = isInvalidLoad 
        ? (Math.random() > 0.5 ? 220 + Math.random() * 5 : 245 + Math.random() * 10)
        : baseVoltage;
      const current = isInvalidLoad
        ? (Math.random() > 0.5 ? 1 + Math.random() * 0.8 : 3.2 + Math.random() * 0.5)
        : baseCurrent;

      const power = voltage * current;
      const currentLoss = isPowerLoss ? 0 : power * (0.02 + Math.random() * 0.03); // 2-5% loss
      const monthlyPower = 150 + Math.random() * 50; // kWh this month

      return {
        voltage: parseFloat(voltage.toFixed(2)),
        current: parseFloat(current.toFixed(3)),
        power: parseFloat(power.toFixed(2)),
        currentLoss: parseFloat(currentLoss.toFixed(2)),
        monthlyPower: parseFloat(monthlyPower.toFixed(2)),
        timestamp: Date.now(),
      };
    };

    // Generate initial history
    const initialHistory: EnergyData[] = [];
    for (let i = 0; i < 20; i++) {
      initialHistory.push({
        ...generateData(),
        timestamp: Date.now() - (20 - i) * 5000,
      });
    }
    setDataHistory(initialHistory);
    setCurrentData(initialHistory[initialHistory.length - 1]);

    // Update every 5 seconds (matching ESP32 interval)
    const interval = setInterval(() => {
      if (isSystemOn) {
        const newData = generateData();
        setCurrentData(newData);
        setDataHistory((prev) => {
          const newHistory = [...prev, newData];
          return newHistory.slice(-MAX_HISTORY);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSystemOn]);

  const toggleSystem = useCallback(() => {
    setIsSystemOn((prev) => !prev);
  }, []);

  return {
    isConnected: true, // Simulated is always "connected"
    isSystemOn,
    currentData,
    dataHistory,
    toggleSystem,
    connectionError: null,
  };
}
