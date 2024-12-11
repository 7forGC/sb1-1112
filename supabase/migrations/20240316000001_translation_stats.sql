-- Create translation_stats table
CREATE TABLE translation_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  count INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE translation_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own translation stats" ON translation_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own translation stats" ON translation_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translation stats" ON translation_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_translation_stats_last_reset ON translation_stats(last_reset);