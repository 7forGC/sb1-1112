import React from 'react';
import { MessageSquare, Phone, Video } from 'lucide-react';

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'message',
      user: 'John Doe',
      time: '5m ago',
      icon: MessageSquare,
      iconColor: 'text-blue-500'
    },
    {
      id: 2,
      type: 'call',
      user: 'Jane Smith',
      time: '15m ago',
      icon: Phone,
      iconColor: 'text-green-500'
    },
    {
      id: 3,
      type: 'video',
      user: 'Mike Johnson',
      time: '1h ago',
      icon: Video,
      iconColor: 'text-purple-500'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className={`rounded-full p-2 ${activity.iconColor} bg-opacity-10`}>
                    <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'message' ? 'Sent you a message' :
                       activity.type === 'call' ? 'Missed call' : 'Video call ended'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};