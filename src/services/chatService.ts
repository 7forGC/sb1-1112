import { supabase } from '../config/supabase';
import OpenAI from 'openai';
import type { Message } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const chatService = {
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    language: string
  ): Promise<string> {
    // First detect toxicity and moderate content
    const moderation = await openai.moderations.create({
      input: content
    });

    if (moderation.results[0].flagged) {
      throw new Error('Message content violates community guidelines');
    }

    // Store message in Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        language
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async translateMessage(messageId: string, targetLanguage: string): Promise<void> {
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('content, language')
      .eq('id', messageId)
      .single();

    if (fetchError) throw fetchError;
    if (message.language === targetLanguage) return;

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `Translate the following text from ${message.language} to ${targetLanguage}. Preserve formatting and emojis.`
        },
        {
          role: 'user',
          content: message.content
        }
      ],
      temperature: 0.3
    });

    const translation = completion.choices[0].message.content;

    const { error: updateError } = await supabase
      .from('messages')
      .update({
        translations: {
          ...message.translations,
          [targetLanguage]: translation
        }
      })
      .eq('id', messageId);

    if (updateError) throw updateError;
  },

  async generateReply(messageContent: string, context: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant in a chat conversation. Generate a natural, contextually appropriate reply. Context: ${context}`
        },
        {
          role: 'user',
          content: messageContent
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0].message.content || '';
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
  },

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .match({ id: messageId, sender_id: userId });

    if (error) throw error;
  },

  async markAsRead(messageIds: string[], userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .eq('receiver_id', userId);

    if (error) throw error;
  }
};