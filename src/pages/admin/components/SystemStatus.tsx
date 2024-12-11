import React from 'react';
import { Server, Database, Cpu, Memory } from 'lucide-react';

interface SystemMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.FC<any>;
}

const systemMetrics: SystemMetric[] = [
  {
    label: 'Server Status',
    value: 'Online',
    status: 'good',
    icon: Server
  },
  {
    label: 'Database Load',
    value: '42%',
    status: 'good',
    icon: Database
  },
  {
    label: 'CPU Usage',
    value: '78%',
    status: 'warning',
    icon: Cpu
  },
  {
    label: 'Memory Usage',
    value: '85%',
    status: 'critical',
    icon: Memory
  }
];

export const SystemStatus = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="space-y-4">
          {systemMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<SystemMetric> = ({ label, value, status, icon: Icon }) => {
  const statusColors = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

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
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};