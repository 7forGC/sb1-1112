-- Create network_stats table
CREATE TABLE network_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  wifi JSONB NOT NULL DEFAULT '{"downloaded": 0, "uploaded": 0, "total": 0}'::jsonb,
  mobile JSONB NOT NULL DEFAULT '{"downloaded": 0, "uploaded": 0, "total": 0}'::jsonb,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  total BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reset_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE network_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own network stats" ON network_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own network stats" ON network_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own network stats" ON network_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_network_stats_user_id ON network_stats(user_id);
CREATE INDEX idx_network_stats_reset_at ON network_stats(reset_at);

-- Create updated_at trigger
CREATE TRIGGER set_network_stats_timestamp
  BEFORE UPDATE ON network_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();