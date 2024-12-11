import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase';
import { useImageCompression } from './useImageCompression';

export const useWallpaper = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { compressImage } = useImageCompression();

  const uploadWallpaper = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `wallpapers/${user.uid}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('wallpapers')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wallpapers')
        .getPublicUrl(filePath);

      // Update user settings with new wallpaper
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          'settings': {
            ...user.settings,
            theme: {
              ...user.settings.theme,
              chatBackground: publicUrl
            }
          }
        })
        .eq('uid', user.uid);

      if (updateError) throw updateError;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading wallpaper:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteWallpaper = async (wallpaperUrl: string): Promise<void> => {
    if (!user) throw new Error('Not authenticated');

    try {
      setLoading(true);

      // Extract file path from URL
      const urlParts = wallpaperUrl.split('/');
      const filePath = `wallpapers/${user.uid}/${urlParts[urlParts.length - 1]}`;

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('wallpapers')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Reset wallpaper in user settings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          'settings': {
            ...user.settings,
            theme: {
              ...user.settings.theme,
              chatBackground: 'default'
            }
          }
        })
        .eq('uid', user.uid);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadWallpaper,
    deleteWallpaper,
    loading
  };
};