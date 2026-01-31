import { Zap, Gauge, Activity, Battery, AlertTriangle, Clock } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { PowerSwitch } from '@/components/PowerSwitch';
import { EnergyChart } from '@/components/EnergyChart';
import { PowerLossTimeline } from '@/components/PowerLossTimeline';
import { LoadValidation } from '@/components/LoadValidation';
import { AnomalyDetection } from '@/components/AnomalyDetection';
import { DailyEnergySummary } from '@/components/DailyEnergySummary';
import { ApplianceConnection } from '@/components/ApplianceConnection';
import { BehaviorLearning } from '@/components/BehaviorLearning';
import { useSimulatedData } from '@/hooks/useSimulatedData';
import { useBehaviorLearning } from '@/hooks/useBehaviorLearning';
// import { useMqtt } from '@/hooks/useMqtt'; // Uncomment for real MQTT connection

const Index = () => {
  // Use simulated data for demo - switch to useMqtt() for real ESP32 connection
  const {
    isConnected,
    isSystemOn,
    currentData,
    dataHistory,
    toggleSystem,
    connectionError,
  } = useSimulatedData();
  // } = useMqtt(); // Uncomment for real MQTT connection

  // Unsupervised ML for behavior learning
  const learningResult = useBehaviorLearning(dataHistory);

  // Calculate power loss duration
  const powerLossEvents = dataHistory.filter(
    (d) => d.voltage < 10 || d.current < 0.1
  );
  const powerLossDuration = powerLossEvents.length * 5; // seconds

  // Determine metric statuses
  const getVoltageStatus = () => {
    if (!currentData) return 'danger';
    if (currentData.voltage < 10) return 'danger';
    if (currentData.voltage < 230 || currentData.voltage > 240) return 'warning';
    return 'success';
  };

  const getCurrentStatus = () => {
    if (!currentData) return 'danger';
    if (currentData.current < 0.1) return 'danger';
    if (currentData.current < 2 || currentData.current > 3) return 'warning';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              Energy Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              ESP32 MQTT Dashboard • IP: 10.73.18.34
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ConnectionStatus isConnected={isConnected} error={connectionError} />
            <PowerSwitch
              isOn={isSystemOn}
              onToggle={toggleSystem}
              disabled={!isConnected}
            />
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MetricCard
          label="Voltage"
          value={currentData?.voltage.toFixed(1) ?? '--'}
          unit="V"
          icon={Gauge}
          status={getVoltageStatus()}
          subtitle="Valid: 230-240V"
        />
        <MetricCard
          label="Current"
          value={currentData?.current.toFixed(3) ?? '--'}
          unit="A"
          icon={Activity}
          status={getCurrentStatus()}
          subtitle="Valid: 2-3A"
        />
        <MetricCard
          label="Power"
          value={currentData?.power.toFixed(1) ?? '--'}
          unit="W"
          icon={Zap}
          status={currentData?.power && currentData.power > 0 ? 'normal' : 'danger'}
        />
        <MetricCard
          label="Monthly Energy"
          value={currentData?.monthlyPower.toFixed(1) ?? '--'}
          unit="kWh"
          icon={Battery}
          status="normal"
        />
        <MetricCard
          label="Current Loss"
          value={currentData?.currentLoss.toFixed(2) ?? '--'}
          unit="W"
          icon={AlertTriangle}
          status={currentData?.currentLoss && currentData.currentLoss > 20 ? 'warning' : 'normal'}
        />
        <MetricCard
          label="Loss Duration"
          value={powerLossDuration}
          unit="sec"
          icon={Clock}
          status={powerLossDuration > 0 ? 'danger' : 'success'}
          subtitle={`${powerLossEvents.length} events`}
        />
      </section>

      {/* Status Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <ApplianceConnection currentData={currentData} isSystemOn={isSystemOn} />
        <LoadValidation data={currentData} />
        <AnomalyDetection data={dataHistory} currentData={currentData} />
      </section>

      {/* ML Behavior Learning */}
      <section className="mb-8">
        <BehaviorLearning learningResult={learningResult} />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <EnergyChart
          data={dataHistory}
          dataKey="voltage"
          title="Voltage vs Time"
          unit="V"
          color="hsl(220 90% 56%)"
          validRange={{ min: 230, max: 240 }}
        />
        <EnergyChart
          data={dataHistory}
          dataKey="current"
          title="Current vs Time"
          unit="A"
          color="hsl(145 65% 42%)"
          validRange={{ min: 2, max: 3 }}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <EnergyChart
          data={dataHistory}
          dataKey="power"
          title="Power vs Time"
          unit="W"
          color="hsl(38 92% 50%)"
        />
        <EnergyChart
          data={dataHistory}
          dataKey="currentLoss"
          title="Power Loss vs Time"
          unit="W"
          color="hsl(0 72% 51%)"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PowerLossTimeline data={dataHistory} />
        <DailyEnergySummary data={dataHistory} />
      </section>
    </div>
  );
};

export default Index;
