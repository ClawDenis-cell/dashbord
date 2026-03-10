-- Dashboard Database Schema
-- Tables: projects, tickets, todos, kanban_config

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    column_name VARCHAR(100) DEFAULT 'To Do',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kanban configuration table
CREATE TABLE IF NOT EXISTS kanban_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_name VARCHAR(255) NOT NULL DEFAULT 'Main Board',
    columns_array TEXT[] NOT NULL DEFAULT ARRAY['To Do', 'In Progress', 'Done'],
    user_id VARCHAR(255) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers to tables
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kanban_config_updated_at ON kanban_config;
CREATE TRIGGER update_kanban_config_updated_at
    BEFORE UPDATE ON kanban_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default kanban configuration
INSERT INTO kanban_config (board_name, columns_array)
VALUES ('Main Board', ARRAY['To Do', 'In Progress', 'Done'])
ON CONFLICT DO NOTHING;

-- Create indexes for common queries
CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_column_name ON tickets(column_name);
CREATE INDEX idx_todos_completed ON todos(completed);
