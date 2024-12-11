import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { Chat } from '../types';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chats')
          .select(`
            id,
            name,
            avatar,
            online,
            last_message:messages (
              content,
              timestamp
            )
          `)
          .order('last_message.timestamp', { ascending: false });

        if (error) throw error;
        setChats(data || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to changes
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchChats)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { chats, loading };
};