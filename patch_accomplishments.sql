-- ============================================================
-- PATCH: Add Missing KPI Accomplishments (Q1 & Q2 Actuals)
-- Run this in the Supabase SQL Editor.
-- Based on seed_cy2026.sql indicator names.
-- ============================================================

DO $$
DECLARE
  ind_id INTEGER;
BEGIN

  -- No. of firms assisted (Trainings) - Q1: 25, Q2: 38
  SELECT id INTO ind_id FROM indicators WHERE name = 'No. of firms assisted (Trainings)' LIMIT 1;
  IF ind_id IS NOT NULL THEN
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 25);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 38);
  END IF;

  -- No. of training participants - Q1: 195, Q2: 312
  SELECT id INTO ind_id FROM indicators WHERE name = 'No. of training participants' LIMIT 1;
  IF ind_id IS NOT NULL THEN
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 195);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 312);
  END IF;

  -- Employment Generated (in Person-Months) - Q1: 110, Q2: 95
  SELECT id INTO ind_id FROM indicators WHERE name = 'Employment Generated (in Person-Months)' LIMIT 1;
  IF ind_id IS NOT NULL THEN
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 110);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 95);
  END IF;

  -- No. of New Jobs Generated - Q1: 2, Q2: 1
  SELECT id INTO ind_id FROM indicators WHERE name = 'No. of New Jobs Generated' LIMIT 1;
  IF ind_id IS NOT NULL THEN
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 2);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 1);
  END IF;

END $$;
