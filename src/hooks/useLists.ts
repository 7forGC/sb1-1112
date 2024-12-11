import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';

export const useLists = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Subscribe to lists changes
    const subscription = supabase
      .channel('lists')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `user_id=eq.${user.uid}`
        },
        () => {
          // Fetch updated lists when changes occur
          fetchLists();
        }
      )
      .subscribe();

    // Initial fetch
    fetchLists();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchLists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createList = async (listData: any) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('lists')
      .insert([{
        ...listData,
        user_id: user.uid,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateList = async (listId: string, updates: any) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .eq('user_id', user.uid);

    if (error) throw error;
  };

  const deleteList = async (listId: string) => {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', user.uid);

    if (error) throw error;
  };

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList
  };
};