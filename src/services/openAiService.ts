import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const openAiService = {
  async generateResponse(prompt: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE),
        max_tokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS)
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  },

  async moderateContent(content: string): Promise<boolean> {
    try {
      const moderation = await openai.moderations.create({
        input: content
      });

      return !moderation.results[0].flagged;
    } catch (error) {
      console.error('Content moderation error:', error);
      throw error;
    }
  },

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Preserve formatting and emojis.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      });

      return completion.choices[0].message.content || text;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  async detectLanguage(text: string): Promise<string> {
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
  },

  async generateImageDescription(imageUrl: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Generate a concise description of the image. Focus on key elements and context.'
          },
          {
            role: 'user',
            content: `Image URL: ${imageUrl}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return completion.choices[0].message.content || 'No description available';
    } catch (error) {
      console.error('Image description error:', error);
      throw error;
    }
  },

  async suggestReply(context: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Generate a natural, contextually appropriate reply for a chat conversation.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('Reply suggestion error:', error);
      throw error;
    }
  }
};