-- SQL Schema Migration: Create Performance Folders / Workspaces Table

CREATE TABLE IF NOT EXISTS performance_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    year INT NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial CY 2026 performance folder
INSERT INTO performance_folders (name, year, description, status) 
VALUES (
    'CY 2026 PSTO Performance Monitoring', 
    2026, 
    'Official performance indicators, administrative deliverables, and support-to-operations target matrices for Davao Oriental for CY 2026.', 
    'Active'
)
ON CONFLICT (year) DO NOTHING;

-- Automated Trigger to Cascade Delete Targets and Accomplishments on Folder deletion
CREATE OR REPLACE FUNCTION delete_performance_data_for_year()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM targets WHERE year = OLD.year;
    DELETE FROM accomplishments WHERE year = OLD.year;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_performance_data_for_year ON performance_folders;

CREATE TRIGGER trg_delete_performance_data_for_year
AFTER DELETE ON performance_folders
FOR EACH ROW
EXECUTE FUNCTION delete_performance_data_for_year();
