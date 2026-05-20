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

    -- 30. No. of S&T Promotional Activities Conducted
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of S&T Promotional Activities Conducted' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 9)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 9;
    END IF;

    -- 31. No. of Examinees (Undergrad & JLSS)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Examinees (Undergrad & JLSS)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 432)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 432;
    END IF;

    -- 32. No. of On-Going Scholars
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of On-Going Scholars' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 32)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 32;
    END IF;

    -- 33. Percentage of municipalities with DOST Scholarship applicants
    SELECT id INTO ind_id FROM indicators WHERE name = 'Percentage of municipalities with DOST Scholarship applicants' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 100)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 100;
    END IF;

    -- 34. No. of Networks/Linkages Established and Maintained
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Networks/Linkages Established and Maintained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 12)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 12;
    END IF;

    -- 35. No. of Projects co-funded (LGU-DOST)
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Projects co-funded (LGU-DOST)' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 1)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 1;
    END IF;

    -- 36. No. of Trainings / fora conducted for LGUs
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Trainings / fora conducted for LGUs' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 6)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 6;
    END IF;

    -- 37. No. of trainings conducted for NGAs
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of trainings conducted for NGAs' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 4)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 4;
    END IF;

    -- 38. Non-Paying Lab Services (Setting to 0 explicitly)
    SELECT id INTO ind_id FROM indicators WHERE name = 'Number of non-paying laboratory services' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) ON CONFLICT DO NOTHING;
    END IF;

    -- 39. % GRIND activity facilitated and coordinated for the grassroots
    SELECT id INTO ind_id FROM indicators WHERE name = '% GRIND activity facilitated and coordinated for the grassroots' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 40. No. of NRCP membership promotion/fora conducted/facilitated
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of NRCP membership promotion/fora conducted/facilitated' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 41. % of targeted SETI ecosystem engagement rate
    SELECT id INTO ind_id FROM indicators WHERE name = '% of targeted SETI ecosystem engagement rate' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 42. % of public elementary and HS with STARBOOKS
    SELECT id INTO ind_id FROM indicators WHERE name = '% of public elementary and HS with STARBOOKS' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 32.00)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 32.00;
    END IF;

    -- 43. No. of STARBOOKS installation, deployment, and knowledge
    -- Note: DB name is truncated: 'No. of STARBOOKS installation, deployment, and knowledge'
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of STARBOOKS installation, deployment, and knowledge' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 2)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 2;
    END IF;

    -- 44. No. of Report of Disbursement prepared and submitted
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Report of Disbursement prepared and submitted' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) 
        VALUES (ind_id, 2026, 1, 2)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 2;
    END IF;

    -- 45. % Increase of investment from project cooperators/stakeholders
    SELECT id INTO ind_id FROM indicators WHERE name = '% Increase of investment from project cooperators/stakeholders' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0)
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 46. Financial Ratings (Obligation/Disbursement)
    SELECT id INTO ind_id FROM indicators WHERE name = '% Rating for Obligation/Allotment attained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = '% Rating for Disbursement/Allotment attained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = '% Rating for Disbursement/Obligation attained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 47. Support to Operations - Functional
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of training attended before the end of the year' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = 'No. of Quality Management System Maintained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = '5S Audit Score attained' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    -- 48. Support to Operations - Strategic
    SELECT id INTO ind_id FROM indicators WHERE name = '% of personnel with Subject Matter Expertise' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = '% of personnel with >=4.2 Overall Employee Morale Index/Score' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = 'Rating of IQA for 5S in PSTO' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = 'Overall CSF Rating' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = 'Overall Net Promoter Score' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;
    SELECT id INTO ind_id FROM indicators WHERE name = 'Project Fund Utilization' LIMIT 1;
    IF ind_id IS NOT NULL THEN
        INSERT INTO accomplishments (indicator_id, year, quarter, value) VALUES (ind_id, 2026, 1, 0) 
        ON CONFLICT (indicator_id, year, quarter) DO UPDATE SET value = 0;
    END IF;

    RAISE NOTICE 'Q1 Accomplishments have been fully synchronized (Operations, Enhancement, Admin, Support).';
END $$;
