import type { AdminAction } from '../types/admin.types';

export const validateAdminAction = (action: AdminAction): boolean => {
  const requiredFields = ['type', 'performedBy', 'timestamp'];
  return requiredFields.every(field => field in action);
};

export const validateMetrics = (metrics: any): boolean => {
  const requiredMetrics = [
    'serverStatus',
    'database',
    'performance'
  ];
  return requiredMetrics.every(metric => metric in metrics);
};

export const validatePermissions = (
  userRole: string,
  requiredRole: string[]
): boolean => {
  const roleHierarchy = {
    superadmin: 3,
    admin: 2,
    moderator: 1
  };

  const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = Math.max(
    ...requiredRole.map(role => roleHierarchy[role as keyof typeof roleHierarchy] || 0)
  );

  return userRoleLevel >= requiredLevel;
};