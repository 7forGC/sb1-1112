import { supabase } from '../config/supabase';
import type { Message } from '../types';

export const messageService = {
  async sendMessage(
    senderId: string, 
    receiverId: string, 
    text: string, 
    language: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content: text,
        language
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  subscribeToMessages(userId: string, callback: (messages: Message[]) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId},receiver_id=eq.${userId}`
        },
        (payload) => {
          // Fetch updated messages
          this.getMessages(userId).then(callback);
        }
      )
      .subscribe();
  },

  async getMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Message[];
  }
};