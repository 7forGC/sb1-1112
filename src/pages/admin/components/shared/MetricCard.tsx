import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { MetricStatus } from '../../types/metrics.types';

interface MetricCardProps {
  label: string;
  value: string | number;
  status: MetricStatus;
  icon: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  status,
  icon: Icon
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg">
          <Icon className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{value}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
};