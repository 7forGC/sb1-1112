import { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/api/adminApi';
import type { SystemMetrics } from '../types/admin.types';

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminApi.getSystemMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially and then every 30 seconds
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusSummary = useMemo(() => {
    if (!metrics) return null;
    return {
      isHealthy: metrics.serverStatus.status === 'online' && 
                 metrics.performance.cpuUsage < 90 &&
                 metrics.performance.memoryUsage < 90,
      alerts: []
    };
  }, [metrics]);

  return { metrics, loading, error, statusSummary };
};