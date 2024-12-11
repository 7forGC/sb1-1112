export type MetricStatus = 'good' | 'warning' | 'critical';

export interface ServerMetrics {
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  lastRestart: Date;
}

export interface DatabaseMetrics {
  connections: number;
  queryLoad: number;
  diskUsage: number;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLoad: number;
}

export interface SystemMetrics {
  serverStatus: ServerMetrics;
  database: DatabaseMetrics;
  performance: PerformanceMetrics;
}

export interface ServerMetricsProps {
  metrics: ServerMetrics;
}

export interface DatabaseMetricsProps {
  metrics: DatabaseMetrics;
}

export interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
}