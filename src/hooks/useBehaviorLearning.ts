import { useState, useEffect, useCallback } from 'react';
import { EnergyData } from './useMqtt';

export interface BehaviorCluster {
  id: number;
  centroid: { voltage: number; current: number; power: number };
  label: string;
  color: string;
  count: number;
}

export interface LearningResult {
  clusters: BehaviorCluster[];
  currentCluster: number | null;
  anomalyScore: number;
  isLearning: boolean;
  dataPointsCollected: number;
  minDataPoints: number;
}

// Simple K-means implementation for unsupervised learning
function kMeans(
  data: { voltage: number; current: number; power: number }[],
  k: number,
  maxIterations: number = 100
): { centroids: { voltage: number; current: number; power: number }[]; assignments: number[] } {
  if (data.length < k) {
    return { centroids: [], assignments: [] };
  }

  // Normalize data for better clustering
  const normalize = (arr: number[]) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    return arr.map((v) => (v - min) / range);
  };

  const voltages = normalize(data.map((d) => d.voltage));
  const currents = normalize(data.map((d) => d.current));
  const powers = normalize(data.map((d) => d.power));

  const normalizedData = data.map((_, i) => ({
    voltage: voltages[i],
    current: currents[i],
    power: powers[i],
  }));

  // Initialize centroids using k-means++ strategy
  const centroids: { voltage: number; current: number; power: number }[] = [];
  centroids.push(normalizedData[Math.floor(Math.random() * normalizedData.length)]);

  for (let i = 1; i < k; i++) {
    const distances = normalizedData.map((point) => {
      const minDist = Math.min(
        ...centroids.map((c) => euclideanDistance(point, c))
      );
      return minDist * minDist;
    });
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;
    for (let j = 0; j < normalizedData.length; j++) {
      random -= distances[j];
      if (random <= 0) {
        centroids.push(normalizedData[j]);
        break;
      }
    }
  }

  let assignments: number[] = new Array(normalizedData.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = normalizedData.map((point) => {
      let minDist = Infinity;
      let minIdx = 0;
      centroids.forEach((centroid, idx) => {
        const dist = euclideanDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          minIdx = idx;
        }
      });
      return minIdx;
    });

    // Check for convergence
    if (newAssignments.every((a, i) => a === assignments[i])) {
      break;
    }
    assignments = newAssignments;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterPoints = normalizedData.filter((_, i) => assignments[i] === c);
      if (clusterPoints.length > 0) {
        centroids[c] = {
          voltage: clusterPoints.reduce((s, p) => s + p.voltage, 0) / clusterPoints.length,
          current: clusterPoints.reduce((s, p) => s + p.current, 0) / clusterPoints.length,
          power: clusterPoints.reduce((s, p) => s + p.power, 0) / clusterPoints.length,
        };
      }
    }
  }

  // Denormalize centroids back to original scale
  const voltageMin = Math.min(...data.map((d) => d.voltage));
  const voltageMax = Math.max(...data.map((d) => d.voltage));
  const currentMin = Math.min(...data.map((d) => d.current));
  const currentMax = Math.max(...data.map((d) => d.current));
  const powerMin = Math.min(...data.map((d) => d.power));
  const powerMax = Math.max(...data.map((d) => d.power));

  const denormalizedCentroids = centroids.map((c) => ({
    voltage: c.voltage * (voltageMax - voltageMin) + voltageMin,
    current: c.current * (currentMax - currentMin) + currentMin,
    power: c.power * (powerMax - powerMin) + powerMin,
  }));

  return { centroids: denormalizedCentroids, assignments };
}

function euclideanDistance(
  a: { voltage: number; current: number; power: number },
  b: { voltage: number; current: number; power: number }
): number {
  return Math.sqrt(
    Math.pow(a.voltage - b.voltage, 2) +
    Math.pow(a.current - b.current, 2) +
    Math.pow(a.power - b.power, 2)
  );
}

const CLUSTER_LABELS = ['Normal Operation', 'High Load', 'Low Load', 'Power Saving', 'Anomaly'];
const CLUSTER_COLORS = ['hsl(145 65% 42%)', 'hsl(38 92% 50%)', 'hsl(220 90% 56%)', 'hsl(280 65% 60%)', 'hsl(0 72% 51%)'];

const MIN_DATA_POINTS = 30;
const K_CLUSTERS = 4;

export function useBehaviorLearning(dataHistory: EnergyData[]): LearningResult {
  const [clusters, setClusters] = useState<BehaviorCluster[]>([]);
  const [currentCluster, setCurrentCluster] = useState<number | null>(null);
  const [anomalyScore, setAnomalyScore] = useState(0);
  const [isLearning, setIsLearning] = useState(true);

  // Train model when enough data is collected
  useEffect(() => {
    if (dataHistory.length < MIN_DATA_POINTS) {
      setIsLearning(true);
      return;
    }

    setIsLearning(false);

    const trainingData = dataHistory.map((d) => ({
      voltage: d.voltage,
      current: d.current,
      power: d.power,
    }));

    const { centroids, assignments } = kMeans(trainingData, K_CLUSTERS);

    if (centroids.length === 0) return;

    // Count points in each cluster
    const counts = new Array(K_CLUSTERS).fill(0);
    assignments.forEach((a) => counts[a]++);

    // Create cluster objects with labels based on centroid characteristics
    const newClusters: BehaviorCluster[] = centroids.map((centroid, idx) => {
      let label = CLUSTER_LABELS[idx] || `Cluster ${idx + 1}`;
      
      // Auto-label based on power characteristics
      if (centroid.power < 100) label = 'Low Load';
      else if (centroid.power > 500) label = 'High Load';
      else if (centroid.voltage < 200) label = 'Undervoltage';
      else label = 'Normal Operation';

      return {
        id: idx,
        centroid,
        label,
        color: CLUSTER_COLORS[idx],
        count: counts[idx],
      };
    });

    setClusters(newClusters);

    // Classify current data point
    if (dataHistory.length > 0) {
      const current = dataHistory[dataHistory.length - 1];
      const currentNorm = { voltage: current.voltage, current: current.current, power: current.power };
      
      let minDist = Infinity;
      let nearestCluster = 0;
      centroids.forEach((centroid, idx) => {
        const dist = euclideanDistance(currentNorm, centroid);
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = idx;
        }
      });
      
      setCurrentCluster(nearestCluster);
      
      // Calculate anomaly score based on distance from nearest centroid
      const avgDist = dataHistory.reduce((sum, d) => {
        const point = { voltage: d.voltage, current: d.current, power: d.power };
        return sum + Math.min(...centroids.map((c) => euclideanDistance(point, c)));
      }, 0) / dataHistory.length;
      
      setAnomalyScore(Math.min(100, (minDist / (avgDist * 2)) * 100));
    }
  }, [dataHistory]);

  return {
    clusters,
    currentCluster,
    anomalyScore,
    isLearning,
    dataPointsCollected: dataHistory.length,
    minDataPoints: MIN_DATA_POINTS,
  };
}
