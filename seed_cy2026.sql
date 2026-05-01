-- CY 2026 Seed Data Script
-- Execute this after schema.sql to populate the database with the initial CY 2026 Targets and some mock Q1/Q2 accomplishments.

DO $$
DECLARE
    sect_op UUID;
    sect_enh UUID;
    sect_admin UUID;
    sect_supp UUID;

    cat_tech_acq UUID;
    cat_inn_fund UUID;
    cat_econ_imp UUID;
    cat_tech_train UUID;
    cat_tech_cons UUID;
    cat_pkg_lbl UUID;
    cat_st_info UUID;
    cat_strat_op UUID;
    
    -- Categories for Enhancement
    cat_lab_serv UUID;
    cat_st_promo UUID;
    cat_st_scholar UUID;
    cat_datbed UUID;
    cat_networks UUID;
    cat_strat_enh UUID;
    
    -- Categories for General Admin
    cat_admin_func UUID;
    cat_admin_strat UUID;
    
    -- Categories for Support to Operations
    cat_supp_func UUID;
    cat_supp_strat UUID;
    
    ind_id UUID;
BEGIN
    -- ==========================================
    -- 1. Create Sections
    -- ==========================================
    INSERT INTO sections (name, order_index) VALUES ('I. Operations', 1) RETURNING id INTO sect_op;
    INSERT INTO sections (name, order_index) VALUES ('II. Enhancement of Science and Technology', 2) RETURNING id INTO sect_enh;
    INSERT INTO sections (name, order_index) VALUES ('III. General Administrative Services', 3) RETURNING id INTO sect_admin;
    INSERT INTO sections (name, order_index) VALUES ('IV. Support to Operations', 4) RETURNING id INTO sect_supp;

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
    -- 2b. Create Categories (for Enhancement)
    -- ==========================================
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'Non-Paying Laboratory Services', 'Functional', 1) RETURNING id INTO cat_lab_serv;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'S&T Promotion', 'Functional', 2) RETURNING id INTO cat_st_promo;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'S&T Scholarship', 'Functional', 3) RETURNING id INTO cat_st_scholar;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'DATBED', 'Functional', 4) RETURNING id INTO cat_datbed;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'Networks/Linkages', 'Functional', 5) RETURNING id INTO cat_networks;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_enh, 'Strategic Deliverables', 'Strategic', 6) RETURNING id INTO cat_strat_enh;

    -- ==========================================
    -- 2c. Create Categories (for General Admin)
    -- ==========================================
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_admin, 'Functional Deliverables', 'Functional', 1) RETURNING id INTO cat_admin_func;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_admin, 'Strategic Deliverables', 'Strategic', 2) RETURNING id INTO cat_admin_strat;

    -- ==========================================
    -- 2d. Create Categories (for Support to Operations)
    -- ==========================================
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_supp, 'Functional Deliverables', 'Functional', 1) RETURNING id INTO cat_supp_func;
    INSERT INTO categories (section_id, name, deliverable_type, order_index) VALUES (sect_supp, 'Strategic Deliverables', 'Strategic', 2) RETURNING id INTO cat_supp_strat;

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
    -- II. Enhancement of Science and Technology
    -- ==========================================
    
    -- Non-Paying Laboratory Services
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_lab_serv, 'Number of non-paying laboratory services', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_lab_serv, 'Number of firms assisted (Lab Services)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    -- S&T Promotion
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_promo, 'No. of S&T Promotional Activities Conducted', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 2, 2, 2, 2, 8);

    -- S&T Scholarship
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'No. of applicants facilitated (Undergrad and JLSS)', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 15, 100, 115);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'No. of Examinees (Undergrad & JLSS)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 80, 0, 0, 80);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'No. of Qualifiers notified', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 5, 0, 5);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'No. of On-Going Scholars', NULL, 'COUNT', 'SUM', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 8, 0, 8);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'No. of Graduates issued with certificates and temporary clearance', NULL, 'COUNT', 'SUM', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_st_scholar, 'Percentage of municipalities with DOST Scholarship applicants', NULL, 'PERCENTAGE', 'LATEST', 6) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 70, 70);

    -- DATBED
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_datbed, 'No. of Schools Accredited', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_datbed, 'No. of Projects', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_datbed, 'No. of Student Beneficiary', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 0, 0);

    -- Networks/Linkages
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_networks, 'No. of Networks/Linkages Established and Maintained', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 10, 10, 5, 5, 30);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_networks, 'No. of Projects co-funded (LGU-DOST)', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_networks, 'No. of Trainings / fora conducted for LGUs', NULL, 'COUNT', 'SUM', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 5, 5, 5, 5, 20);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_networks, 'No. of Projects co-funded (NGA-DOST)', NULL, 'COUNT', 'SUM', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 1, 0, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_networks, 'No. of trainings conducted for NGAs', NULL, 'COUNT', 'SUM', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 1, 1, 1, 4);

    -- Strategic Deliverables (Enhancement)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_enh, '% GRIND activity facilitated and coordinated for the grassroots', NULL, 'PERCENTAGE', 'LATEST', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 100, 0, 100, 100);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_enh, 'No. of NRCP membership promotion/fora conducted/facilitated', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_enh, '% of targeted SETI ecosystem engagement rate', NULL, 'PERCENTAGE', 'LATEST', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 100, 0, 100, 100);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_enh, '% of public elementary and HS with STARBOOKS', NULL, 'PERCENTAGE', 'LATEST', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 30, 30);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_strat_enh, 'No. of STARBOOKS installation, deployment, and knowledge', NULL, 'COUNT', 'SUM', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 3, 0, 3);

    -- ==========================================
    -- III. General Administrative Services
    -- ==========================================
    
    -- Functional Deliverables (Admin)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_admin_func, 'No. of Report of Disbursement prepared and submitted', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 1, 1, 1, 4);

    -- Strategic Deliverables (Admin)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_admin_strat, '% Increase of investment from project cooperators/stakeholders', NULL, 'PERCENTAGE', 'LATEST', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 58, 0, 58, 58);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_admin_strat, '% Rating for Obligation/Allotment attained', NULL, 'PERCENTAGE', 'LATEST', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 96, 96);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_admin_strat, '% Rating for Disbursement/Allotment attained', NULL, 'PERCENTAGE', 'LATEST', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 85, 85);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_admin_strat, '% Rating for Disbursement/Obligation attained', NULL, 'PERCENTAGE', 'LATEST', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 88, 88);

    -- ==========================================
    -- IV. Support to Operations
    -- ==========================================
    
    -- Functional Deliverables (Support)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_func, 'No. of training attended before the end of the year', NULL, 'COUNT', 'SUM', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 1, 2, 2, 1, 6);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_func, 'No. of Quality Management System Maintained', NULL, 'COUNT', 'SUM', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 1, 1);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_func, '5S Audit Score attained', NULL, 'COUNT', 'LATEST', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 4, 3.50);

    -- Strategic Deliverables (Support)
    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, '% of personnel with Subject Matter Expertise', NULL, 'PERCENTAGE', 'LATEST', 1) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 69, 69);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, '% of personnel with >=4.2 Overall Employee Morale Index/Score', NULL, 'PERCENTAGE', 'LATEST', 2) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 100, 100);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, 'Rating of IQA for 5S in PSTO', NULL, 'COUNT', 'LATEST', 3) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 3.5, 3.5);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, 'Overall CSF Rating', NULL, 'COUNT', 'LATEST', 4) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 4.5, 4.5, 4.5, 4.5, 4.5);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, 'Overall Net Promoter Score', NULL, 'PERCENTAGE', 'LATEST', 5) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 90, 90);

    INSERT INTO indicators (category_id, name, program, data_type, aggregation_type, order_index) 
    VALUES (cat_supp_strat, 'Project Fund Utilization', NULL, 'PERCENTAGE', 'LATEST', 6) RETURNING id INTO ind_id;
    INSERT INTO targets (indicator_id, year, q1_target, q2_target, q3_target, q4_target, annual_target) 
    VALUES (ind_id, 2026, 0, 0, 0, 96, 96);

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
