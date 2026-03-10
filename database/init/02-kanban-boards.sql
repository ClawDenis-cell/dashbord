-- Migration: Create kanban_boards table and update tickets
-- Run this after 01-init.sql for existing installations

-- Create kanban_boards table (project-specific boards)
CREATE TABLE IF NOT EXISTS kanban_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    columns_array TEXT[] NOT NULL DEFAULT ARRAY['To Do', 'In Progress', 'Done'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add board_id to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES kanban_boards(id) ON DELETE SET NULL;

-- Create index for board lookups
CREATE INDEX IF NOT EXISTS idx_tickets_board_id ON tickets(board_id);
CREATE INDEX IF NOT EXISTS idx_kanban_boards_project_id ON kanban_boards(project_id);

-- Create trigger for kanban_boards
DROP TRIGGER IF EXISTS update_kanban_boards_updated_at ON kanban_boards;
CREATE TRIGGER update_kanban_boards_updated_at
    BEFORE UPDATE ON kanban_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration: Move existing kanban config to board for each project
-- This creates a default board for each existing project
DO $$
DECLARE
    project_record RECORD;
    new_board_id UUID;
    default_columns TEXT[];
BEGIN
    -- Get default columns from existing kanban_config, or use defaults
    SELECT columns_array INTO default_columns FROM kanban_config ORDER BY created_at DESC LIMIT 1;
    IF default_columns IS NULL THEN
        default_columns := ARRAY['To Do', 'In Progress', 'Done'];
    END IF;

    -- Create a default board for each project that doesn't have one
    FOR project_record IN SELECT id FROM projects WHERE NOT EXISTS (
        SELECT 1 FROM kanban_boards WHERE kanban_boards.project_id = projects.id
    )
    LOOP
        INSERT INTO kanban_boards (name, project_id, columns_array)
        VALUES ('Default Board', project_record.id, default_columns);
    END LOOP;
END $$;

-- Update tickets to set board_id based on project_id
-- This assigns tickets to the first board of their project
UPDATE tickets 
SET board_id = (
    SELECT id FROM kanban_boards 
    WHERE kanban_boards.project_id = tickets.project_id 
    LIMIT 1
)
WHERE project_id IS NOT NULL AND board_id IS NULL;