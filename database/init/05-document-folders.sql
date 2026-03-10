-- Migration: Document folders and document extensions

-- Document folders table
CREATE TABLE IF NOT EXISTS document_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_folders_user ON document_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_folders_parent ON document_folders(parent_id);

-- Add folder_id to documents (may already exist, use DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'documents' AND column_name = 'folder_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL;
        CREATE INDEX idx_documents_folder_id ON documents(folder_id);
    END IF;
END $$;
