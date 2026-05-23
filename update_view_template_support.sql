-- =========================================================================
-- SQL PATCH: Update View to Support Predefined Indicator Template for All Years
-- Run this in your Supabase SQL Editor to make CY 2027 and other years work.
-- =========================================================================

DROP VIEW IF EXISTS v_indicator_data;
CREATE OR REPLACE VIEW v_indicator_data AS
WITH years AS (
    SELECT DISTINCT year FROM performance_folders
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
    COALESCE(t.q4_target, 0::numeric(15,2)) as q4_target,
    s.full_name as section_full_name,
    s.order_index as section_order,
    c.order_index as category_order,
    i.order_index as indicator_order
FROM indicators i
JOIN categories c ON i.category_id = c.id
JOIN sections s ON c.section_id = s.id
CROSS JOIN years y
LEFT JOIN targets t ON i.id = t.indicator_id AND t.year = y.year
LEFT JOIN accomplishments a ON a.indicator_id = i.id AND a.year = y.year;

