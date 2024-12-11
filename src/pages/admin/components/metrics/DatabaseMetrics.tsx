import React from 'react';
import { Database } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { formatMetricValue } from '../../utils/formatters';
import type { DatabaseMetricsProps } from '../../types/metrics.types';

export const DatabaseMetrics: React.FC<DatabaseMetricsProps> = ({ metrics }) => {
  const { connections, queryLoad, diskUsage } = metrics;

  return (
    <div className="space-y-4">
      <MetricCard
        label="Active Connections"
        value={formatMetricValue(connections)}
        status={connections > 1000 ? 'warning' : 'good'}
        icon={Database}
      />
      <MetricCard
        label="Query Load"
        value={`${queryLoad}%`}
        status={queryLoad > 80 ? 'critical' : queryLoad > 60 ? 'warning' : 'good'}
        icon={Database}
      />
    </div>
  );
};