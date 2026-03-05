-- Add updated_at column to notes table if it doesn't exist
ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

