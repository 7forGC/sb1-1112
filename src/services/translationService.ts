import OpenAI from 'openai';
import { supabase } from '../config/supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const FREE_TRANSLATIONS_PER_DAY = 500;
const TRANSLATION_RESET_HOURS = 24;

export class TranslationService {
  async translateText(text: string, targetLang: string, userId: string): Promise<string> {
    try {
      // Check translation limits
      const stats = await this.getTranslationStats(userId);
      if (stats.count >= FREE_TRANSLATIONS_PER_DAY) {
        throw new Error(`Daily translation limit reached (${FREE_TRANSLATIONS_PER_DAY}). Try again tomorrow.`);
      }

      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLang}. Only respond with the translation, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE),
        max_tokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS)
      });

      await this.incrementTranslationCount(userId);
      return completion.choices[0].message.content || text;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async detectLanguage(text: string, userId: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the following text. Only respond with the ISO 639-1 language code (e.g., "en", "es", "fr"), nothing else.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0,
        max_tokens: 2
      });

      return completion.choices[0].message.content?.toLowerCase() || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  private async getTranslationStats(userId: string) {
    const { data: stats, error } = await supabase
      .from('translation_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    if (!stats) {
      return { count: 0, lastReset: Date.now() };
    }

    const hoursSinceReset = (Date.now() - new Date(stats.last_reset).getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= TRANSLATION_RESET_HOURS) {
      await supabase
        .from('translation_stats')
        .upsert({
          user_id: userId,
          count: 0,
          last_reset: new Date().toISOString()
        });
      return { count: 0, lastReset: Date.now() };
    }

    return {
      count: stats.count,
      lastReset: new Date(stats.last_reset).getTime()
    };
  }

  private async incrementTranslationCount(userId: string) {
    const { error } = await supabase
      .from('translation_stats')
      .upsert({
        user_id: userId,
        count: 1,
        last_reset: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  }
}

export const translationService = new TranslationService();