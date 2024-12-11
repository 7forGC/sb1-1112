import { API_CONFIG } from '../../config/api';
import type { SystemMetrics, AdminAction } from '../../types/admin.types';

export const adminApi = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.METRICS}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },

  async performAction(action: AdminAction): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(action)
    });
    if (!response.ok) throw new Error('Failed to perform action');
  }
};