import { useState } from 'react';
import { adminApi } from '../../../services/api/adminApi';
import { validateAdminAction } from '../utils/validators';
import type { AdminAction, AdminActionType } from '../types/actions.types';

export const useAdminActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (
    type: AdminActionType,
    payload?: unknown
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    const action: AdminAction = {
      type,
      payload,
      timestamp: new Date(),
      performedBy: localStorage.getItem('adminToken') || '',
      status: 'pending'
    };

    try {
      if (!validateAdminAction(action)) {
        throw new Error('Invalid action format');
      }

      await adminApi.performAction(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    performAction,
    loading,
    error
  };
};