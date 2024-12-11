import { supabase } from '../config/supabase';
import OpenAI from 'openai';
import type { Group, GroupMessage } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const groupService = {
  async createGroup(name: string, description: string | null, createdBy: string): Promise<string> {
    const { data, error } = await supabase
      .from('groups')
      .insert([{
        name,
        description,
        created_by: createdBy
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async addMember(groupId: string, userId: string, role: string = 'member'): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: userId,
        role
      }]);

    if (error) throw error;
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .match({ group_id: groupId, user_id: userId });

    if (error) throw error;
  },

  async sendGroupMessage(
    groupId: string,
    senderId: string,
    content: string,
    language: string
  ): Promise<string> {
    // Check content with OpenAI moderation
    const moderation = await openai.moderations.create({
      input: content
    });

    if (moderation.results[0].flagged) {
      throw new Error('Message content violates community guidelines');
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert([{
        group_id: groupId,
        sender_id: senderId,
        content,
        language
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async translateGroupMessage(messageId: string, targetLanguage: string): Promise<void> {
    const { data: message, error: fetchError } = await supabase
      .from('group_messages')
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
      .from('group_messages')
      .update({
        translations: {
          ...message.translations,
          [targetLanguage]: translation
        }
      })
      .eq('id', messageId);

    if (updateError) throw updateError;
  },

  async getGroupMessages(groupId: string): Promise<GroupMessage[]> {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GroupMessage[];
  },

  subscribeToGroupMessages(groupId: string, callback: (messages: GroupMessage[]) => void) {
    return supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          // Fetch updated messages
          this.getGroupMessages(groupId).then(callback);
        }
      )
      .subscribe();
  },

  async summarizeGroupChat(groupId: string): Promise<string> {
    const { data: messages, error } = await supabase
      .from('group_messages')
      .select('content')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    const chatHistory = messages.map(m => m.content).join('\n');

    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Summarize the following chat conversation in a concise way, highlighting key points and decisions made.'
        },
        {
          role: 'user',
          content: chatHistory
        }
      ],
      temperature: 0.3,
      max_tokens: 250
    });

    return completion.choices[0].message.content || '';
  }
};