-- CY 2026 Seed Data Script
-- Execute this after schema.sql to populate the database with the initial CY 2026 Targets and some mock Q1/Q2 accomplishments.

DO $$
DECLARE
    sect_op UUID;
    sect_enh UUID;
    sect_admin UUID;
    sect_sup UUID;

    cat_tech_acq UUID;
    cat_inn_fund UUID;
    cat_econ_imp UUID;
    cat_tech_train UUID;
    cat_tech_cons UUID;
    cat_pkg_lbl UUID;
    cat_st_info UUID;
    cat_strat_op UUID;
    
    ind_id UUID;
BEGIN
    -- ==========================================
    -- 1. Create Sections
    -- ==========================================
    INSERT INTO sections (name, order_index) VALUES ('I. Operations', 1) RETURNING id INTO sect_op;
    INSERT INTO sections (name, order_index) VALUES ('II. Enhancement of Science and Technology', 2) RETURNING id INTO sect_enh;
    INSERT INTO sections (name, order_index) VALUES ('III. General Administrative Services', 3) RETURNING id INTO sect_admin;
    INSERT INTO sections (name, order_index) VALUES ('IV. Support to Operations', 4) RETURNING id INTO sect_sup;

    -- ==========================================
    -- 2. Create Categories (for Operations)
    -- ==========================================
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Technology Acquisition & Upgrading', 'Functional', 1) RETURNING id INTO cat_tech_acq;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Innovation Fund', 'Functional', 2) RETURNING id INTO cat_inn_fund;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Economic Impact', 'Functional', 3) RETURNING id INTO cat_econ_imp;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Technology Trainings & Techno Fora', 'Functional', 4) RETURNING id INTO cat_tech_train;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Technical Consultancy Services', 'Functional', 5) RETURNING id INTO cat_tech_cons;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Packaging and Labeling Design', 'Functional', 6) RETURNING id INTO cat_pkg_lbl;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'S&T Information and Referral', 'Functional', 7) RETURNING id INTO cat_st_info;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_op, 'Strategic Deliverables', 'Strategic', 8) RETURNING id INTO cat_strat_op;

    -- ==========================================
    -- 3. Create Indicators & CY 2026 Targets
    -- ==========================================

    -- Technology Acquisition & Upgrading
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_acq, 'No. of Projects Approved', 'SETUP', 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 2, 1, 1, 4);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_acq, 'No. of Projects Approved', 'LGIA', 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 1, 0, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_acq, 'Amount Funded', 'SETUP', 'CURRENCY', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1200000, 2200000, 0, 809216.11, 4209216.11);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_acq, 'Amount Funded', 'LGIA', 'CURRENCY', 'SUM', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 153377.00, 2452260.43, 417257.34, 457257.33, 3480152.10);
    
    -- Innovation Fund
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_inn_fund, 'No. of technology interventions provided through i-Fund', 'i-Fund', 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 5, 5, 4, 15);
    
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_inn_fund, 'No. of customers provided with i-Fund Assistance', 'i-Fund', 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 5, 5, 3, 14);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_inn_fund, 'No. of Start-up Firms Assisted', 'i-Fund', 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    -- Economic Impact
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_econ_imp, 'Gross Sales (P000)', NULL, 'CURRENCY', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1350, 1400, 1400, 1400, 5550);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_econ_imp, 'No. of New Jobs Generated', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 3, 0, 0, 3, 6);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_econ_imp, 'Employment Generated (in Person-Months)', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 120, 100, 100, 85, 405);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_econ_imp, 'Percentage increased in productivity', NULL, 'PERCENTAGE', 'LATEST', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 25, 25);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_econ_imp, 'Percentage increased in employment generated', NULL, 'PERCENTAGE', 'LATEST', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 2, 2);

    -- Technology Trainings and Techno Fora
    -- a. Technology Trainings
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. Technology Trainings conducted', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 10, 15, 14, 14, 53);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. of firms assisted (Trainings)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 30, 50, 50, 59, 189);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. of training participants', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 200, 350, 350, 283, 1183);

    -- b. Technofora
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. of Techno forums/Seminars conducted', NULL, 'COUNT', 'SUM', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 1, 1, 0, 2);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. of firms assisted (Technofora)', NULL, 'COUNT', 'SUM', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 5, 5, 0, 10);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_train, 'No. of technofora participants', NULL, 'COUNT', 'SUM', 6) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 25, 25, 0, 50);

    -- Technical Consultancy Services
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'MPEX (including implemented recommendations from consultants)', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 4, 4);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'CPT', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Food Safety', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 1, 2, 0, 4);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Energy Audit', NULL, 'COUNT', 'SUM', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Halal Training', NULL, 'COUNT', 'SUM', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Halal Assessment', NULL, 'COUNT', 'SUM', 6) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'BOSH', NULL, 'COUNT', 'SUM', 7) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Digitalization', NULL, 'COUNT', 'SUM', 8) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'R&D Shopfloor Consultancy', NULL, 'COUNT', 'SUM', 9) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Biocircular green technology', NULL, 'COUNT', 'SUM', 10) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_tech_cons, 'Other Consultancy Services Conducted', NULL, 'COUNT', 'SUM', 11) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    -- Packaging and Labeling design
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_pkg_lbl, 'Number of package design brief forms submitted', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 2, 2, 3, 0, 7);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_pkg_lbl, 'Number of firms assisted (Packaging)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 2, 2, 2, 0, 6);

    -- S&T Information and Referral
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_info, 'Number of S&T informations provided/referred', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 6, 6, 5, 3, 20);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_info, 'Number of customers assisted (Referral)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 6, 6, 5, 3, 20);

    -- Strategic Deliverables (Operations)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% municipalities availed SETUP funds', NULL, 'PERCENTAGE', 'LATEST', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 50, 0, 50, 50);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% municipalities availed GIA funds', NULL, 'PERCENTAGE', 'LATEST', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 50, 0, 50, 50);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% SETUP refund rate', NULL, 'PERCENTAGE', 'LATEST', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 88.50, 0, 88.50, 88.50);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% business enterprise adopting SMART SETI tools and', NULL, 'PERCENTAGE', 'LATEST', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 31, 0, 31, 31);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% municipalities with Communities of Practice', NULL, 'PERCENTAGE', 'LATEST', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 32, 0, 32, 32);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% SETUP Cooperators with Certifications/ Accreditations/', NULL, 'PERCENTAGE', 'LATEST', 6) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 9, 0, 9, 9);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, 'Number of MSMEs (SETUP Cooperators) adopted digital', NULL, 'COUNT', 'SUM', 7) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, 'Number of MSMEs (SETUP Cooperators) assisted in OHS', NULL, 'COUNT', 'SUM', 8) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, 'Number of MSMEs (SETUP Cooperators) adopted Circular', NULL, 'COUNT', 'SUM', 9) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% of SETI Scorecards deployed in ISS projects', NULL, 'PERCENTAGE', 'LATEST', 10) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 100, 0, 100, 100);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, '% of completed DOST-funded/assisted SETI project output', NULL, 'PERCENTAGE', 'LATEST', 11) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 50, 0, 50, 50);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_op, 'Number of SETI partnerships with local/international', NULL, 'COUNT', 'SUM', 12) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    -- ==========================================
    -- 4. Insert Mock Accomplishments (Actuals)
    -- This ensures the dashboard charts have data to display immediately.
    -- ==========================================
    
    -- Amount Funded (SETUP)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Amount Funded' AND program = 'SETUP' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 1200000);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 2100000);

    -- Amount Funded (LGIA)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Amount Funded' AND program = 'LGIA' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 150000);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 2300000);

    -- Trainings Conducted
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. Technology Trainings conducted' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 11);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 16);

    -- SETUP refund rate
    SELECT id INTO ind_id FROM indicators WHERE name = '% SETUP refund rate' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 85.0);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 89.2);

    -- Gross Sales
    SELECT id INTO ind_id FROM indicators WHERE name = 'Gross Sales (P000)' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 1400);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 1450);

    -- Projects Approved (SETUP)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Projects Approved' AND program = 'SETUP' LIMIT 1;
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 1);
    INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 2, 2);

END $$;
