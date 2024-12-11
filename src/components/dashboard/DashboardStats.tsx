import React from 'react';
import { Users, MessageSquare, Video, Clock } from 'lucide-react';

export const DashboardStats = () => {
  const stats = [
    { name: 'Total Contacts', value: '2,345', icon: Users },
    { name: 'Messages Today', value: '145', icon: MessageSquare },
    { name: 'Call Minutes', value: '320', icon: Video },
    { name: 'Active Time', value: '4.2h', icon: Clock }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};