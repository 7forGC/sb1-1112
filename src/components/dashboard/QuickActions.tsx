import React from 'react';
import { MessageSquare, Phone, Video, Users } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      name: 'New Message',
      icon: MessageSquare,
      bgColor: 'bg-blue-500',
      onClick: () => console.log('New message')
    },
    {
      name: 'Start Call',
      icon: Phone,
      bgColor: 'bg-green-500',
      onClick: () => console.log('Start call')
    },
    {
      name: 'Video Chat',
      icon: Video,
      bgColor: 'bg-purple-500',
      onClick: () => console.log('Video chat')
    },
    {
      name: 'Create Group',
      icon: Users,
      bgColor: 'bg-pink-500',
      onClick: () => console.log('Create group')
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className={`rounded-full p-3 ${action.bgColor} bg-opacity-10 mb-3`}>
                <action.icon className={`h-6 w-6 ${action.bgColor} text-opacity-90`} />
              </div>
              <span className="text-sm font-medium text-gray-900">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};