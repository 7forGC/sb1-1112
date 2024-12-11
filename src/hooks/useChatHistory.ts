import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';

interface ChatHistoryItem {
  id: string;
  type: 'messages' | 'audio-call' | 'video-call';
  participant: {
    id: string;
    name: string;
    avatar?: string;
  };
  content?: string;
  timestamp: number;
  duration?: number;
  status: 'active' | 'archived' | 'deleted';
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      try {
        // Get messages history
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender:sender_id(id, display_name, photo_url),
            receiver:receiver_id(id, display_name, photo_url)
          `)
          .or(`sender_id.eq.${user.uid},receiver_id.eq.${user.uid}`)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        // Get calls history
        const { data: calls, error: callsError } = await supabase
          .from('calls')
          .select(`
            id,
            type,
            status,
            started_at,
            ended_at,
            duration,
            caller:caller_id(id, display_name, photo_url),
            receiver:receiver_id(id, display_name, photo_url)
          `)
          .or(`caller_id.eq.${user.uid},receiver_id.eq.${user.uid}`)
          .order('started_at', { ascending: false });

        if (callsError) throw callsError;

        // Combine and format history
        const historyItems: ChatHistoryItem[] = [
          ...messages.map(msg => ({
            id: msg.id,
            type: 'messages' as const,
            participant: msg.sender.id === user.uid ? msg.receiver : msg.sender,
            content: msg.content,
            timestamp: new Date(msg.created_at).getTime(),
            status: 'active' as const
          })),
          ...calls.map(call => ({
            id: call.id,
            type: call.type as 'audio-call' | 'video-call',
            participant: call.caller.id === user.uid ? call.receiver : call.caller,
            timestamp: new Date(call.started_at).getTime(),
            duration: call.duration,
            status: 'active' as const
          }))
        ].sort((a, b) => b.timestamp - a.timestamp);

        setHistory(historyItems);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const exportHistory = async () => {
    const historyData = history.map(item => ({
      ...item,
      exportedAt: new Date().toISOString()
    }));

    const blob = new Blob([JSON.stringify(historyData, null, 2)], {
      type: 'application/json'
    });

    return URL.createObjectURL(blob);
  };

  const deleteHistory = async (itemId: string) => {
    if (!user) return;

    try {
      // Check if it's a message or call
      const item = history.find(h => h.id === itemId);
      if (!item) return;

      if (item.type === 'messages') {
        const { error } = await supabase
          .from('messages')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        // For calls, we just update the status
        const { error } = await supabase
          .from('calls')
          .update({ status: 'deleted' })
          .eq('id', itemId);

        if (error) throw error;
      }

      setHistory(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting history:', error);
      throw error;
    }
  };

  const archiveChat = async (itemId: string) => {
    if (!user) return;

    try {
      // Check if it's a message or call
      const item = history.find(h => h.id === itemId);
      if (!item) return;

      if (item.type === 'messages') {
        const { error } = await supabase
          .from('messages')
          .update({ status: 'archived' })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calls')
          .update({ status: 'archived' })
          .eq('id', itemId);

        if (error) throw error;
      }

      setHistory(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: 'archived' } : item
        )
      );
    } catch (error) {
      console.error('Error archiving chat:', error);
      throw error;
    }
  };

  return {
    history,
    loading,
    exportHistory,
    deleteHistory,
    archiveChat
  };
};