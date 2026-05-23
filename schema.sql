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
-- This view uses a CROSS JOIN with years to ensure all predefined indicators 
-- are returned as a template for any year (e.g. 2027), even if no targets yet exist.
DROP VIEW IF EXISTS v_indicator_data;
CREATE OR REPLACE VIEW v_indicator_data AS
WITH years AS (
    SELECT DISTINCT year FROM targets
    UNION
    SELECT DISTINCT year FROM accomplishments
    UNION
    SELECT 2026 AS year
    UNION
    SELECT 2027 AS year
)
SELECT 
    i.id as indicator_id,
    i.name as indicator,
    s.name as section,
    c.name as category,
    c.deliverable_type,
    y.year,
    a.quarter,
    CASE WHEN a.quarter IS NOT NULL THEN 'Q' || a.quarter ELSE NULL END as label,
    i.program,
    COALESCE(a.value, 0::numeric(15,2)) as value,
    LOWER(i.data_type) as value_type,
    CASE 
        WHEN i.data_type = 'CURRENCY' THEN 'PHP'
        WHEN i.data_type = 'PERCENTAGE' THEN '%'
        ELSE NULL 
    END as unit,
    i.aggregation_type,
    COALESCE(t.annual_target, 0::numeric(15,2)) as annual_target,
    COALESCE(t.q1_target, 0::numeric(15,2)) as q1_target,
    COALESCE(t.q2_target, 0::numeric(15,2)) as q2_target,
    COALESCE(t.q3_target, 0::numeric(15,2)) as q3_target,
    COALESCE(t.q4_target, 0::numeric(15,2)) as q4_target
FROM indicators i
JOIN categories c ON i.category_id = c.id
JOIN sections s ON c.section_id = s.id
CROSS JOIN years y
LEFT JOIN targets t ON i.id = t.indicator_id AND t.year = y.year
LEFT JOIN accomplishments a ON a.indicator_id = i.id AND a.year = y.year;
