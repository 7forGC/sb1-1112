export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  lastLogin: Date;
  createdAt: Date;
}

export interface SystemMetrics {
  serverStatus: {
    status: 'online' | 'offline' | 'maintenance';
    uptime: number;
    lastRestart: Date;
  };
  database: {
    connections: number;
    queryLoad: number;
    diskUsage: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkLoad: number;
  };
}

export interface AdminAction {
  type: string;
  payload?: any;
  timestamp: Date;
  performedBy: string;
  status: 'success' | 'failure';
  details?: string;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}