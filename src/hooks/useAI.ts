import { useState } from 'react';
import { openAiService } from '../services/openAiService';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await openAiService.generateResponse(prompt);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (content: string) => {
    setLoading(true);
    setError(null);
    try {
      return await openAiService.moderateContent(content);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text: string, targetLanguage: string) => {
    setLoading(true);
    setError(null);
    try {
      return await openAiService.translateText(text, targetLanguage);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const detectLanguage = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      return await openAiService.detectLanguage(text);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateImageDescription = async (imageUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      return await openAiService.generateImageDescription(imageUrl);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suggestReply = async (context: string) => {
    setLoading(true);
    setError(null);
    try {
      return await openAiService.suggestReply(context);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateResponse,
    moderateContent,
    translateText,
    detectLanguage,
    generateImageDescription,
    suggestReply
  };
};