export const formatMetricValue = (value: number, unit: string = ''): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit}`;
  }
  return `${value}${unit}`;
};

export const getStatusColor = (value: number, thresholds: { warning: number; critical: number }): 'good' | 'warning' | 'critical' => {
  if (value >= thresholds.critical) return 'critical';
  if (value >= thresholds.warning) return 'warning';
  return 'good';
};

export const validateAdminAction = (action: string, userRole: string): boolean => {
  const rolePermissions = {
    superadmin: ['all'],
    admin: ['backup', 'cache', 'notice', 'message'],
    moderator: ['notice', 'message']
  };

  return rolePermissions[userRole as keyof typeof rolePermissions]?.includes(action) || 
         rolePermissions[userRole as keyof typeof rolePermissions]?.includes('all') || 
         false;
};