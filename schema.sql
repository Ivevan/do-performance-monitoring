-- CY 2026 Performance Targets Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sections Table (e.g., Operations, Support to Operations)
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    order_index INT NOT NULL
);

-- Categories Table (e.g., Technology Acquisition, Economic Impact)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    deliverable_type VARCHAR(50) NOT NULL, -- 'Functional', 'Strategic'
    order_index INT NOT NULL
);

-- Indicators Table (The actual metrics)
CREATE TABLE indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    program VARCHAR(100), -- e.g., 'SETUP', 'LGIA'
    data_type VARCHAR(50) NOT NULL, -- 'COUNT', 'CURRENCY', 'PERCENTAGE', 'RATING'
    aggregation_type VARCHAR(50) NOT NULL, -- 'SUM' (cumulative), 'LATEST' (year-end), 'AVERAGE'
    order_index INT NOT NULL
);

-- Targets Table (For CY 2026 and beyond)
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
    year INT NOT NULL,
    q1_target NUMERIC(15,2) DEFAULT 0,
    q2_target NUMERIC(15,2) DEFAULT 0,
    q3_target NUMERIC(15,2) DEFAULT 0,
    q4_target NUMERIC(15,2) DEFAULT 0,
    annual_target NUMERIC(15,2) NOT NULL,
    UNIQUE(indicator_id, year)
);

-- Actuals/Accomplishments Table
CREATE TABLE accomplishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter INT NOT NULL CHECK (quarter IN (1, 2, 3, 4)),
    value NUMERIC(15,2) NOT NULL,
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(indicator_id, year, quarter)
);

-- Create a view to match the v_indicator_data shape used by the frontend
CREATE OR REPLACE VIEW v_indicator_data AS
SELECT 
    i.name as indicator,
    s.name as section,
    a.year,
    a.quarter,
    'Q' || a.quarter as label,
    i.program,
    a.value,
    LOWER(i.data_type) as value_type,
    CASE 
        WHEN i.data_type = 'CURRENCY' THEN 'PHP'
        WHEN i.data_type = 'PERCENTAGE' THEN '%'
        ELSE NULL 
    END as unit,
    i.aggregation_type
FROM accomplishments a
JOIN indicators i ON a.indicator_id = i.id
JOIN categories c ON i.category_id = c.id
JOIN sections s ON c.section_id = s.id;
