-- ══════════════════════════════════════════════════════════════
-- Messages Table for EduHub Messaging System
-- Allows students to message lecturers
-- Allows admins to broadcast messages to students and lecturers
-- ══════════════════════════════════════════════════════════════

-- Drop existing table if needed (for development)
-- DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Sender information
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(20) NOT NULL,
  
  -- Recipient information
  -- For direct messages, recipient_id is set
  -- For broadcast messages, recipient_id is NULL and recipient_role is set
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_role VARCHAR(20), -- 'student', 'lecturer', 'all' for broadcasts
  
  -- Message content
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  
  -- Message metadata
  is_broadcast BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Attachments (future feature - store file paths as JSON array)
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_sender_role CHECK (sender_role IN ('admin', 'student', 'lecturer')),
  CONSTRAINT valid_recipient_role CHECK (recipient_role IS NULL OR recipient_role IN ('student', 'lecturer', 'all')),
  CONSTRAINT valid_recipient CHECK (
    (is_broadcast = TRUE AND recipient_id IS NULL AND recipient_role IS NOT NULL) OR
    (is_broadcast = FALSE AND recipient_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_role ON messages(recipient_role);

-- Create a view for easy message retrieval with user details
CREATE OR REPLACE VIEW messages_with_users AS
SELECT 
  m.id,
  m.sender_id,
  m.sender_role,
  m.recipient_id,
  m.recipient_role,
  m.subject,
  m.body,
  m.is_broadcast,
  m.is_read,
  m.read_at,
  m.attachments,
  m.created_at,
  m.updated_at,
  -- Sender details
  su.email AS sender_email,
  sud.first_name AS sender_first_name,
  sud.last_name AS sender_last_name,
  -- Recipient details (null for broadcasts)
  ru.email AS recipient_email,
  rud.first_name AS recipient_first_name,
  rud.last_name AS recipient_last_name
FROM messages m
LEFT JOIN users su ON m.sender_id = su.id
LEFT JOIN user_details sud ON su.id = sud.user_id
LEFT JOIN users ru ON m.recipient_id = ru.id
LEFT JOIN user_details rud ON ru.id = rud.user_id;

\echo '✓ Messages table and view created successfully'
