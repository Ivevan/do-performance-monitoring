-- ============================================================
-- SQL PATCH: Move Economic Impact under Innovation Fund
-- Run this in your Supabase SQL Editor to update your active DB.
-- ============================================================

DO $$
DECLARE
    inn_fund_id UUID;
    econ_imp_id UUID;
    tech_train_id UUID;
    tech_cons_id UUID;
    pkg_lbl_id UUID;
    st_info_id UUID;
    strat_op_id UUID;
BEGIN
    -- 1. Find the Innovation Fund and Economic Impact category IDs
    SELECT id INTO inn_fund_id FROM categories WHERE name = 'Innovation Fund' AND deliverable_type = 'Functional' LIMIT 1;
    SELECT id INTO econ_imp_id FROM categories WHERE name = 'Economic Impact' AND deliverable_type = 'Functional' LIMIT 1;
    
    IF inn_fund_id IS NOT NULL AND econ_imp_id IS NOT NULL THEN
        -- 2. Move the Economic Impact indicators under Innovation Fund category
        -- and shift their order indexes to start at 4 (since Innovation Fund has indices 1, 2, 3)
        UPDATE indicators 
        SET category_id = inn_fund_id,
            order_index = order_index + 3
        WHERE category_id = econ_imp_id;
        
        -- 3. Delete the now-empty Economic Impact category
        DELETE FROM categories WHERE id = econ_imp_id;

        -- 4. Re-align the order_index of remaining Operations categories
        -- Technology Trainings & Techno Fora
        SELECT id INTO tech_train_id FROM categories WHERE name = 'Technology Trainings & Techno Fora' LIMIT 1;
        IF tech_train_id IS NOT NULL THEN
            UPDATE categories SET order_index = 3 WHERE id = tech_train_id;
        END IF;

        -- Technical Consultancy Services
        SELECT id INTO tech_cons_id FROM categories WHERE name = 'Technical Consultancy Services' LIMIT 1;
        IF tech_cons_id IS NOT NULL THEN
            UPDATE categories SET order_index = 4 WHERE id = tech_cons_id;
        END IF;

        -- Packaging and Labeling Design
        SELECT id INTO pkg_lbl_id FROM categories WHERE name = 'Packaging and Labeling Design' LIMIT 1;
        IF pkg_lbl_id IS NOT NULL THEN
            UPDATE categories SET order_index = 5 WHERE id = pkg_lbl_id;
        END IF;

        -- S&T Information and Referral
        SELECT id INTO st_info_id FROM categories WHERE name = 'S&T Information and Referral' LIMIT 1;
        IF st_info_id IS NOT NULL THEN
            UPDATE categories SET order_index = 6 WHERE id = st_info_id;
        END IF;

        -- Strategic Deliverables
        SELECT id INTO strat_op_id FROM categories WHERE name = 'Strategic Deliverables' AND section_id = (SELECT section_id FROM categories WHERE id = inn_fund_id LIMIT 1) LIMIT 1;
        IF strat_op_id IS NOT NULL THEN
            UPDATE categories SET order_index = 7 WHERE id = strat_op_id;
        END IF;
        
        RAISE NOTICE 'Successfully moved Economic Impact indicators under Innovation Fund and re-aligned category order indexes!';
    ELSE
        RAISE WARNING 'Could not find the target categories. Please verify your seed status.';
    END IF;
END $$;
