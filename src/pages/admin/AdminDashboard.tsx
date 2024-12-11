import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminStats } from './components/AdminStats';
import { SystemStatus } from './components/SystemStatus';
import { QuickActions } from './components/QuickActions';
import { AdminHeader } from './components/AdminHeader';

export const AdminDashboard = () => {
  const { logoutAdmin } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onLogout={logoutAdmin} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AdminStats />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SystemStatus />
          <QuickActions />
        </div>
      </main>
    </div>
  );
};