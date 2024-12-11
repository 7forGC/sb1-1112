import React from 'react';
import { Server } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { formatMetricValue } from '../../utils/formatters';
import type { ServerMetricsProps } from '../../types/metrics.types';

export const ServerMetrics: React.FC<ServerMetricsProps> = ({ metrics }) => {
  const { status, uptime, lastRestart } = metrics;

  return (
    <div className="space-y-4">
      <MetricCard
        label="Server Status"
        value={status}
        status={status === 'online' ? 'good' : 'critical'}
        icon={Server}
      />
      <MetricCard
        label="Uptime"
        value={formatMetricValue(uptime, 'h')}
        status="good"
        icon={Server}
      />
    </div>
  );
};