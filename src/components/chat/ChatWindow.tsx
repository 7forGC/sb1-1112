import React, { useState } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { useMessages } from '../../hooks/useMessages';

interface ChatWindowProps {
  chatId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, loading } = useMessages(chatId);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ChatHeader chatId={chatId} />
      
      <ChatMessages 
        messages={messages}
        loading={loading}
      />

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <ImageIcon size={20} />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};