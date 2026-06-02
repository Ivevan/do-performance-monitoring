-- SQL Schema Migration: Create Audit Logs Table and Triggers

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),            -- Editor display name
    action_type VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(100) NOT NULL, -- 'targets' or 'accomplishments'
    record_id UUID NOT NULL,
    year INT NOT NULL,
    indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
    indicator_name VARCHAR(255) NOT NULL,
    program_name VARCHAR(100),
    change_details JSONB NOT NULL,    -- Details of changes: e.g. { "q1_target": { "old": 10, "new": 15 } }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow read access to authorized editors only" ON public.audit_logs;

-- Define SELECT policy: visible only to authorized editors
CREATE POLICY "Allow read access to authorized editors only" 
ON public.audit_logs FOR SELECT USING (public.is_editor());

-- Trigger function for targets
CREATE OR REPLACE FUNCTION public.process_target_audit()
RETURNS TRIGGER AS $$
DECLARE
    ind_name VARCHAR(255);
    prog_name VARCHAR(100);
    usr_email VARCHAR(255);
    usr_name VARCHAR(255);
    details JSONB;
BEGIN
    -- Resolve indicator details
    SELECT name, program INTO ind_name, prog_name 
    FROM public.indicators 
    WHERE id = COALESCE(NEW.indicator_id, OLD.indicator_id);

    -- Resolve user email from JWT or default to 'system'
    usr_email := LOWER(COALESCE(
        (SELECT auth.jwt() ->> 'email'),
        'system'
    ));

    -- Resolve user name from JWT user_metadata, public.users table, or default to 'System'
    usr_name := COALESCE(
        auth.jwt() -> 'user_metadata' ->> 'full_name',
        auth.jwt() -> 'user_metadata' ->> 'name',
        (SELECT first_name FROM public.users WHERE email = usr_email),
        'System'
    );

    -- Form change details
    IF (TG_OP = 'INSERT') THEN
        details := jsonb_build_object(
            'q1_target', jsonb_build_object('old', null, 'new', NEW.q1_target),
            'q2_target', jsonb_build_object('old', null, 'new', NEW.q2_target),
            'q3_target', jsonb_build_object('old', null, 'new', NEW.q3_target),
            'q4_target', jsonb_build_object('old', null, 'new', NEW.q4_target),
            'annual_target', jsonb_build_object('old', null, 'new', NEW.annual_target)
        );
        
        INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
        VALUES (usr_email, usr_name, TG_OP, 'targets', NEW.id, NEW.year, NEW.indicator_id, ind_name, prog_name, details);
        
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if values actually changed
        IF (NEW.q1_target IS DISTINCT FROM OLD.q1_target OR
            NEW.q2_target IS DISTINCT FROM OLD.q2_target OR
            NEW.q3_target IS DISTINCT FROM OLD.q3_target OR
            NEW.q4_target IS DISTINCT FROM OLD.q4_target OR
            NEW.annual_target IS DISTINCT FROM OLD.annual_target) THEN
            
            details := jsonb_build_object();
            
            IF (NEW.q1_target IS DISTINCT FROM OLD.q1_target) THEN
                details := details || jsonb_build_object('q1_target', jsonb_build_object('old', OLD.q1_target, 'new', NEW.q1_target));
            END IF;
            IF (NEW.q2_target IS DISTINCT FROM OLD.q2_target) THEN
                details := details || jsonb_build_object('q2_target', jsonb_build_object('old', OLD.q2_target, 'new', NEW.q2_target));
            END IF;
            IF (NEW.q3_target IS DISTINCT FROM OLD.q3_target) THEN
                details := details || jsonb_build_object('q3_target', jsonb_build_object('old', OLD.q3_target, 'new', NEW.q3_target));
            END IF;
            IF (NEW.q4_target IS DISTINCT FROM OLD.q4_target) THEN
                details := details || jsonb_build_object('q4_target', jsonb_build_object('old', OLD.q4_target, 'new', NEW.q4_target));
            END IF;
            IF (NEW.annual_target IS DISTINCT FROM OLD.annual_target) THEN
                details := details || jsonb_build_object('annual_target', jsonb_build_object('old', OLD.annual_target, 'new', NEW.annual_target));
            END IF;

            INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
            VALUES (usr_email, usr_name, TG_OP, 'targets', NEW.id, NEW.year, NEW.indicator_id, ind_name, prog_name, details);
        END IF;
        
    ELSIF (TG_OP = 'DELETE') THEN
        details := jsonb_build_object(
            'q1_target', jsonb_build_object('old', OLD.q1_target, 'new', null),
            'q2_target', jsonb_build_object('old', OLD.q2_target, 'new', null),
            'q3_target', jsonb_build_object('old', OLD.q3_target, 'new', null),
            'q4_target', jsonb_build_object('old', OLD.q4_target, 'new', null),
            'annual_target', jsonb_build_object('old', OLD.annual_target, 'new', null)
        );
        
        INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
        VALUES (usr_email, usr_name, TG_OP, 'targets', OLD.id, OLD.year, OLD.indicator_id, ind_name, prog_name, details);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for accomplishments
CREATE OR REPLACE FUNCTION public.process_accomplishment_audit()
RETURNS TRIGGER AS $$
DECLARE
    ind_name VARCHAR(255);
    prog_name VARCHAR(100);
    usr_email VARCHAR(255);
    usr_name VARCHAR(255);
    details JSONB;
BEGIN
    -- Resolve indicator details
    SELECT name, program INTO ind_name, prog_name 
    FROM public.indicators 
    WHERE id = COALESCE(NEW.indicator_id, OLD.indicator_id);

    -- Resolve user email from JWT or default to 'system'
    usr_email := LOWER(COALESCE(
        (SELECT auth.jwt() ->> 'email'),
        'system'
    ));

    -- Resolve user name from JWT user_metadata, public.users table, or default to 'System'
    usr_name := COALESCE(
        auth.jwt() -> 'user_metadata' ->> 'full_name',
        auth.jwt() -> 'user_metadata' ->> 'name',
        (SELECT first_name FROM public.users WHERE email = usr_email),
        'System'
    );

    -- Form change details
    IF (TG_OP = 'INSERT') THEN
        details := jsonb_build_object(
            'value', jsonb_build_object('old', null, 'new', NEW.value),
            'quarter', NEW.quarter,
            'remarks', jsonb_build_object('old', null, 'new', NEW.remarks)
        );
        
        INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
        VALUES (usr_email, usr_name, TG_OP, 'accomplishments', NEW.id, NEW.year, NEW.indicator_id, ind_name, prog_name, details);
        
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if value or remarks actually changed
        IF (NEW.value IS DISTINCT FROM OLD.value OR
            NEW.remarks IS DISTINCT FROM OLD.remarks) THEN
            
            details := jsonb_build_object('quarter', NEW.quarter);
            
            IF (NEW.value IS DISTINCT FROM OLD.value) THEN
                details := details || jsonb_build_object('value', jsonb_build_object('old', OLD.value, 'new', NEW.value));
            END IF;
            IF (NEW.remarks IS DISTINCT FROM OLD.remarks) THEN
                details := details || jsonb_build_object('remarks', jsonb_build_object('old', OLD.remarks, 'new', NEW.remarks));
            END IF;

            INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
            VALUES (usr_email, usr_name, TG_OP, 'accomplishments', NEW.id, NEW.year, NEW.indicator_id, ind_name, prog_name, details);
        END IF;
        
    ELSIF (TG_OP = 'DELETE') THEN
        details := jsonb_build_object(
            'value', jsonb_build_object('old', OLD.value, 'new', null),
            'quarter', OLD.quarter,
            'remarks', jsonb_build_object('old', OLD.remarks, 'new', null)
        );
        
        INSERT INTO public.audit_logs (user_email, user_name, action_type, table_name, record_id, year, indicator_id, indicator_name, program_name, change_details)
        VALUES (usr_email, usr_name, TG_OP, 'accomplishments', OLD.id, OLD.year, OLD.indicator_id, ind_name, prog_name, details);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind triggers to tables
DROP TRIGGER IF EXISTS trg_target_audit ON public.targets;
CREATE TRIGGER trg_target_audit
AFTER INSERT OR UPDATE OR DELETE ON public.targets
FOR EACH ROW EXECUTE FUNCTION public.process_target_audit();

DROP TRIGGER IF EXISTS trg_accomplishment_audit ON public.accomplishments;
CREATE TRIGGER trg_accomplishment_audit
AFTER INSERT OR UPDATE OR DELETE ON public.accomplishments
FOR EACH ROW EXECUTE FUNCTION public.process_accomplishment_audit();
