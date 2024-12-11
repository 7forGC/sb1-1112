-- Create system_updates table
CREATE TABLE system_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL,
  update_url TEXT NOT NULL,
  changelog JSONB NOT NULL DEFAULT '[]',
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  min_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read system updates" ON system_updates
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX idx_system_updates_version ON system_updates(version);
CREATE INDEX idx_system_updates_published_at ON system_updates(published_at);

-- Add version constraint
ALTER TABLE system_updates
  ADD CONSTRAINT valid_version_format 
  CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$');

-- Add expiry constraint
ALTER TABLE system_updates
  ADD CONSTRAINT valid_expiry 
  CHECK (expires_at > published_at);