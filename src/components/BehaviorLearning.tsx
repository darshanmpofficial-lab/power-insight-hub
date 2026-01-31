import { Brain, Activity, Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningResult } from '@/hooks/useBehaviorLearning';
import { Progress } from '@/components/ui/progress';

interface BehaviorLearningProps {
  learningResult: LearningResult;
}

export function BehaviorLearning({ learningResult }: BehaviorLearningProps) {
  const {
    clusters,
    currentCluster,
    anomalyScore,
    isLearning,
    dataPointsCollected,
    minDataPoints,
  } = learningResult;

  const learningProgress = Math.min(100, (dataPointsCollected / minDataPoints) * 100);
  const currentClusterData = currentCluster !== null ? clusters[currentCluster] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Behavior Learning (ML)
        </h3>
        {isLearning ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Training...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-accent">
            <Activity className="h-3 w-3" />
            Model Active
          </div>
        )}
      </div>

      {isLearning ? (
        <div className="space-y-3">
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Collecting data for unsupervised learning...
            </p>
            <p className="text-xs text-muted-foreground">
              {dataPointsCollected} / {minDataPoints} samples
            </p>
          </div>
          <Progress value={learningProgress} className="h-2" />
        </div>
      ) : (
        <>
          {/* Current State */}
          {currentClusterData && (
            <div
              className="rounded-md p-3 mb-4"
              style={{ backgroundColor: `${currentClusterData.color}15` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Behavior</p>
                  <p
                    className="font-medium text-lg"
                    style={{ color: currentClusterData.color }}
                  >
                    {currentClusterData.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Anomaly Score</p>
                  <p className={cn(
                    'font-mono text-lg',
                    anomalyScore > 50 ? 'text-destructive' : anomalyScore > 25 ? 'text-warning' : 'text-accent'
                  )}>
                    {anomalyScore.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learned Clusters */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Learned Patterns (K-Means)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className={cn(
                    'rounded-md p-2 border transition-all',
                    currentCluster === cluster.id
                      ? 'border-2'
                      : 'border-border'
                  )}
                  style={{
                    borderColor: currentCluster === cluster.id ? cluster.color : undefined,
                    backgroundColor: currentCluster === cluster.id ? `${cluster.color}10` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {cluster.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>V: {cluster.centroid.voltage.toFixed(0)}V</p>
                    <p>I: {cluster.centroid.current.toFixed(2)}A</p>
                    <p>P: {cluster.centroid.power.toFixed(0)}W</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cluster.count} samples
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Model trained on {dataPointsCollected} data points using K-Means clustering (K=4).
              The model learns normal operating patterns and detects deviations.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
