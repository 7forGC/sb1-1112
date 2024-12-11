-- Create two_factor table
CREATE TABLE two_factor (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  secret TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_codes TEXT[] DEFAULT '{}'::TEXT[]
);

-- Enable Row Level Security
ALTER TABLE two_factor ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own 2FA settings" ON two_factor
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA settings" ON two_factor
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA settings" ON two_factor
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_two_factor_timestamp
  BEFORE UPDATE ON two_factor
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- Create index
CREATE INDEX idx_two_factor_enabled ON two_factor(enabled);