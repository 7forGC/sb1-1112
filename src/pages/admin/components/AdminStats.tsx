import React from 'react';
import { Users, MessageSquare, Activity } from 'lucide-react';

const stats = {
  totalUsers: 1234,
  activeUsers: 789,
  messagesPerDay: 5678
};

export const AdminStats = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={Users}
        label="Total Users"
        value={stats.totalUsers}
      />
      <StatCard
        icon={Activity}
        label="Active Users"
        value={stats.activeUsers}
      />
      <StatCard
        icon={MessageSquare}
        label="Messages / Day"
        value={stats.messagesPerDay}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.FC<any>;
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);