import React from 'react';
import type { MetricStatus } from '../../types/metrics.types';

interface StatusBadgeProps {
  status: MetricStatus;
}

const statusStyles = {
  good: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);