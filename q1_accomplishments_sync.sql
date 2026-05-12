-- Q1 2026 Accomplishments Sync Script
-- Category: Technology Acquisition & Upgrading

DO $$
DECLARE
    ind_id UUID;
BEGIN
    -- 1. No. of Projects Approved (SETUP)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Projects Approved' AND program = 'SETUP' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 2. No. of Projects Approved (LGIA)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Projects Approved' AND program = 'LGIA' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 2)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 2;
    END IF;

    -- 3. Amount Funded (SETUP)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Amount Funded' AND program = 'SETUP' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 3131000.00)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 3131000.00;
    END IF;

    -- 4. Amount Funded (LGIA)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Amount Funded' AND program = 'LGIA' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 410775.00)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 410775.00;
    END IF;

    -- 5. Gross Sales (P '000)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Gross Sales (P000)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 32097)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 32097;
    END IF;

    -- 6. No. of New Jobs Generated
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of New Jobs Generated' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 7. Employment Generated (in Person-Months)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Employment Generated (in Person-Months)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 939)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 939;
    END IF;

    -- 8. Percentage increased in productivity
    SELECT id INTO ind_id FROM indicators WHERE name = 'Percentage increased in productivity' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 3.39)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 3.39;
    END IF;

    -- 9. Innovation Fund - No. of technology interventions
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of technology interventions provided through i-Fund' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 7)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 7;
    END IF;

    -- 10. Innovation Fund - No. of customers
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of customers provided with i-Fund Assistance' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 6)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 6;
    END IF;

    -- 11. Technology Trainings conducted
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. Technology Trainings conducted' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 15)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 15;
    END IF;

    -- 12. No. of firms assisted (Trainings)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of firms assisted (Trainings)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 41)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 41;
    END IF;

    -- 13. No. of training participants
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of training participants' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 302)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 302;
    END IF;

    -- 14. Techno forums/Seminars conducted
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Techno forums/Seminars conducted' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 3)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 3;
    END IF;

    -- 15. No. of firms assisted (Technofora)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of firms assisted (Technofora)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 22)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 22;
    END IF;

    -- 16. No. of technofora participants
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of technofora participants' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 111)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 111;
    END IF;

    -- 17. Food Safety (Technical Consultancy)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Food Safety' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 1)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 1;
    END IF;

    -- 18. Packaging design brief forms submitted
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of package design brief forms submitted' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 19. S&T Information provided/referred
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of S&T informations provided/referred' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 10)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 10;
    END IF;

    -- 20. Number of customers assisted (S&T)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of customers assisted (Referral)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 8)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 8;
    END IF;

    -- 21. % municipalities availed SETUP funds
    SELECT id INTO ind_id FROM indicators WHERE name = '% municipalities availed SETUP funds' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 81.82)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 81.82;
    END IF;

    -- 22. % municipalities availed GIA funds
    SELECT id INTO ind_id FROM indicators WHERE name = '% municipalities availed GIA funds' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 72.73)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 72.73;
    END IF;

    -- 23. % SETUP refund rate
    SELECT id INTO ind_id FROM indicators WHERE name = '% SETUP refund rate' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 96.25)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 96.25;
    END IF;

    -- 24. % business enterprise adopting SMART SETI tools and systems
    -- Note: DB name is truncated: '% business enterprise adopting SMART SETI tools and'
    SELECT id INTO ind_id FROM indicators WHERE name = '% business enterprise adopting SMART SETI tools and' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 59.62)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 59.62;
    END IF;

    -- 25. % municipalities with Communities of Practice
    SELECT id INTO ind_id FROM indicators WHERE name = '% municipalities with Communities of Practice' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 64.00)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 64.00;
    END IF;

    -- 26. % SETUP Cooperators with Certifications/ Accreditations/ Recognitions
    -- Note: DB name is truncated: '% SETUP Cooperators with Certifications/ Accreditations/'
    SELECT id INTO ind_id FROM indicators WHERE name = '% SETUP Cooperators with Certifications/ Accreditations/' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 11.54)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 11.54;
    END IF;

    -- 27. Number of MSMEs (SETUP Cooperators) assisted in OHS
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of MSMEs (SETUP Cooperators) assisted in OHS' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 1)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 1;
    END IF;

    -- 28. Number of MSMEs (SETUP Cooperators) adopted Circular Economy technologies
    -- Note: DB name is truncated: 'Number of MSMEs (SETUP Cooperators) adopted Circular'
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of MSMEs (SETUP Cooperators) adopted Circular' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 1)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 1;
    END IF;

    -- 29. % of SETI Scorecards deployed in ISS projects
    -- Note: DB name is truncated: '% of SETI Scorecards deployed in ISS projects'
    SELECT id INTO ind_id FROM indicators WHERE name = '% of SETI Scorecards deployed in ISS projects' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 59.62)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 59.62;
    END IF;

    RAISE NOTICE 'Q1 Accomplishments have been fully synchronized (Impact, i-Fund, Trainings, Consultancies, Strategic).';
END $$;
