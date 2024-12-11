import React from 'react';
import { format } from 'date-fns';
import type { Chat } from '../../types';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      <div className="relative">
        <img
          src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}`}
          alt={chat.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {chat.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline">
          <p className="font-medium truncate">{chat.name}</p>
          <span className="text-xs text-gray-500">
            {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {chat.lastMessage.content}
        </p>
      </div>
    </button>
  );
};