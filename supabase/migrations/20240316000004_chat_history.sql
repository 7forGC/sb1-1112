-- Add status column to messages table
ALTER TABLE messages 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'archived', 'deleted'));

-- Add status column to calls table
ALTER TABLE calls 
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'archived', 'deleted'));

-- Create indexes for better query performance
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at);

-- Update RLS policies for messages
CREATE POLICY "Users can view non-deleted messages" ON messages
  FOR SELECT USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id) AND
    deleted_at IS NULL
  );

-- Update RLS policies for calls
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (
    auth.uid() = caller_id OR auth.uid() = receiver_id
  );