-- Create wallpapers bucket policy
INSERT INTO storage.buckets (id, name)
VALUES ('wallpapers', 'Chat wallpapers');

-- Set up storage policies for wallpapers
CREATE POLICY "Users can view own wallpapers" ON storage.objects FOR SELECT
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own wallpapers" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallpapers' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    (CASE 
      WHEN RIGHT(name, 4) = '.jpg' THEN true
      WHEN RIGHT(name, 4) = '.png' THEN true
      WHEN RIGHT(name, 5) = '.jpeg' THEN true
      WHEN RIGHT(name, 5) = '.webp' THEN true
      ELSE false
    END)
  );

CREATE POLICY "Users can delete own wallpapers" ON storage.objects FOR DELETE
  USING (bucket_id = 'wallpapers' AND auth.uid()::text = (storage.foldername(name))[1]);