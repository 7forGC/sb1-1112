import { supabase } from '../config/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const storageService = {
  async getStorageUsage(userId: string): Promise<Record<string, number>> {
    const usage: Record<string, number> = {
      images: 0,
      videos: 0,
      audio: 0,
      documents: 0,
      other: 0
    };

    try {
      // Get storage usage from each bucket
      for (const bucket of ['media', 'stories', 'avatars']) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(userId);

        if (error) throw error;

        data.forEach(file => {
          const size = file.metadata.size;
          const type = file.metadata.mimetype;

          if (type?.startsWith('image/')) usage.images += size;
          else if (type?.startsWith('video/')) usage.videos += size;
          else if (type?.startsWith('audio/')) usage.audio += size;
          else if (type?.includes('document') || type?.includes('pdf')) usage.documents += size;
          else usage.other += size;
        });
      }

      return usage;
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return usage;
    }
  },

  async clearCache(userId: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from('media')
      .list(`${userId}/cache`);

    if (error) throw error;

    const deletePromises = data.map(file =>
      supabase.storage
        .from('media')
        .remove([`${userId}/cache/${file.name}`])
    );

    await Promise.all(deletePromises);
  },

  async deleteUnusedFiles(userId: string): Promise<void> {
    // Get files not accessed in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const bucket of ['media', 'stories']) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (error) throw error;

      const oldFiles = data.filter(file => 
        new Date(file.metadata.lastModified) < thirtyDaysAgo
      );

      const deletePromises = oldFiles.map(file =>
        supabase.storage
          .from(bucket)
          .remove([`${userId}/${file.name}`])
      );

      await Promise.all(deletePromises);
    }
  },

  async analyzeStorageUsage(userId: string): Promise<string> {
    const usage = await this.getStorageUsage(userId);
    
    const completion = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'Analyze storage usage and provide recommendations for optimization.'
        },
        {
          role: 'user',
          content: JSON.stringify(usage)
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    return completion.choices[0].message.content || '';
  }
};