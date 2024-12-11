import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserAvatar } from '../UserAvatar';

export const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Settings className="h-6 w-6" />
            </button>
            {user && <UserAvatar user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
};